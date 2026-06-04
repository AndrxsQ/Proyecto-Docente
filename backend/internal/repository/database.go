package repository

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"

	_ "github.com/lib/pq"
)

type DB struct {
	*sql.DB
}

func NewDB(host, port, user, password, dbname string) (*DB, error) {
	// First, connect to postgres database to check if target database exists
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=postgres sslmode=disable",
		host, port, user, password)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("error connecting to database: %w", err)
	}

	// Check if database exists
	var exists bool
	err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1)", dbname).Scan(&exists)
	if err != nil {
		return nil, fmt.Errorf("error checking if database exists: %w", err)
	}

	// Create database if it doesn't exist
	if !exists {
		log.Printf("Database %s does not exist, creating...", dbname)
		_, err = db.Exec(fmt.Sprintf("CREATE DATABASE %s ENCODING 'UTF8'", dbname))
		if err != nil {
			return nil, fmt.Errorf("error creating database: %w", err)
		}
		log.Printf("Database %s created successfully", dbname)
	}

	// Now connect to the target database
	connStr = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}

	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("error connecting to database: %w", err)
	}

	// Check if tables exist
	var tableExists bool
	err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'facultades')").Scan(&tableExists)
	if err != nil {
		return nil, fmt.Errorf("error checking if tables exist: %w", err)
	}

	// If tables don't exist, run schema.sql and seed.sql
	if !tableExists {
		log.Println("Tables do not exist, running schema.sql...")
		if err := executeSQLFile(db, "db/schema.sql"); err != nil {
			return nil, fmt.Errorf("error executing schema.sql: %w", err)
		}
		log.Println("Schema created successfully")

		log.Println("Running seed.sql...")
		if err := executeSQLFile(db, "db/seed.sql"); err != nil {
			return nil, fmt.Errorf("error executing seed.sql: %w", err)
		}
		log.Println("Seed data inserted successfully")
	}

	log.Println("Database connection established")
	return &DB{db}, nil
}

func executeSQLFile(db *sql.DB, filename string) error {
	// Get the current working directory
	cwd, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("error getting current working directory: %w", err)
	}

	// Navigate to the backend directory
	backendDir := filepath.Join(cwd, "..")
	if filepath.Base(cwd) == "backend" {
		backendDir = cwd
	}

	// Read the SQL file
	sqlPath := filepath.Join(backendDir, filename)
	content, err := ioutil.ReadFile(sqlPath)
	if err != nil {
		return fmt.Errorf("error reading SQL file %s: %w", sqlPath, err)
	}

	// Split by semicolon and execute each statement
	statements := strings.Split(string(content), ";")
	for _, stmt := range statements {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" || strings.HasPrefix(stmt, "--") {
			continue
		}
		_, err := db.Exec(stmt)
		if err != nil {
			log.Printf("Warning: error executing statement: %s\nError: %v", stmt, err)
			// Continue with other statements even if one fails
		}
	}

	return nil
}

func (db *DB) Close() error {
	return db.DB.Close()
}
