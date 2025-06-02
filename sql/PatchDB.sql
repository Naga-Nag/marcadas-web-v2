-- Crear tabla WebUsers solo si no existe
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WebUsers')
BEGIN
    CREATE TABLE WebUsers (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(100) UNIQUE,
        password NVARCHAR(100),
        role NVARCHAR(10) CHECK (role IN ('ADMIN', 'USER')),

        departamento NVARCHAR(50),
        departamentosPermitidos NVARCHAR(50)
    );
END

-- Agregar columna selloJefe solo si no existe
IF NOT EXISTS (
    SELECT * FROM sys.columns WHERE Name = N'selloJefe' AND Object_ID = Object_ID(N'dbo.Dept')
)
BEGIN
    ALTER TABLE dbo.Dept ADD selloJefe IMAGE;
END

-- Agregar columna leyendaJefe solo si no existe
IF NOT EXISTS (
    SELECT * FROM sys.columns WHERE Name = N'leyendaJefe' AND Object_ID = Object_ID(N'dbo.Dept')
)
BEGIN
    ALTER TABLE dbo.Dept ADD leyendaJefe NVARCHAR(100);
END

-- Agregar columna Activo solo si no existe
IF NOT EXISTS (
    SELECT * FROM sys.columns WHERE Name = N'Activo' AND Object_ID = Object_ID(N'dbo.Userinfo')
)
BEGIN
    ALTER TABLE dbo.Userinfo ADD Activo BIT;
END

-- Agregar columna Jornada solo si no existe
IF NOT EXISTS (
    SELECT * FROM sys.columns WHERE Name = N'Jornada' AND Object_ID = Object_ID(N'dbo.Userinfo')
)
BEGIN
    ALTER TABLE dbo.Userinfo ADD Jornada TINYINT;
END

-- Agregar columna CUIL solo si no existe
IF NOT EXISTS (
    SELECT * FROM sys.columns WHERE Name = N'CUIL' AND Object_ID = Object_ID(N'dbo.Userinfo')
)
BEGIN
    ALTER TABLE dbo.Userinfo ADD CUIL NVARCHAR(50);
END

