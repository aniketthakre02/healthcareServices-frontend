-- Initial DB setup for healthcare service
CREATE DATABASE IF NOT EXISTS healthcareservice;
USE healthcareservice;

-- Tables will be auto-created by JPA ddl-auto=update
-- This file ensures DB exists and sets charset
ALTER DATABASE healthcareservice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
