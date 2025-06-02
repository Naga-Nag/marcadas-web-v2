CREATE OR ALTER FUNCTION PersonalPorDepartamento(@Departamento NVARCHAR(50))
RETURNS TABLE
AS
RETURN
    SELECT
        ui.Userid AS UID,
        ui.UserCode AS MR,
        ui.Name AS Nombre,
        d.DeptName AS Departamento,
        ui.CUIL AS CUIL,
        ui.Jornada AS Jornada,
        ui.Activo AS Activo
    FROM dbo.Userinfo ui
    INNER JOIN dbo.Dept d ON ui.Deptid = d.Deptid
    WHERE (@Departamento = 'ARPB' OR d.DeptName = @Departamento)