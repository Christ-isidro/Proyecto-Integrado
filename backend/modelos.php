<?php

class Modelo
{
    private $pdo;

    public function __CONSTRUCT()
    {
        try {
            $opciones = array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8");
            $this->pdo = new PDO('mysql:host=localhost;dbname=rally_tfg', 'root', '', $opciones);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    public function ListarUsuarios()
    {
        try {
            $consulta = "SELECT * FROM usuarios";
            $stmt = $this->pdo->prepare($consulta);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    public function InsertarUsuario($datos)
    {
        try {
            $hashed_password = password_hash($datos->password, PASSWORD_BCRYPT);

            $consulta = "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)";
            $this->pdo->prepare($consulta)->execute(array(
                $datos->nombre,
                $datos->email,
                $hashed_password,
                $datos->rol
            ));
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }
}
