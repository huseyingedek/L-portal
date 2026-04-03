<?php
header('Content-Type: text/html; charset=utf-8');

class AhmDB
{
    private $pdo;
    private $connected;
    private $host = "localhost";
    private $database = "lizaypirlanta_online";
    private $username = "lizaypirlanta_online";
    private $password = "xn1tATvu7L+8";

    public function __construct()
    {
        $dsn = "mysql:host=$this->host;dbname=$this->database;charset=utf8";
        try {
            $this->pdo = new PDO($dsn, $this->username, $this->password);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->connected = true; 
        } catch (PDOException $e) {
            die("Veritabanı bağlantısı başarısız: " . $e->getMessage());
        }
    }

    public function query($sql, $params = [])
    {
        try {
            $statement = $this->pdo->prepare($sql);
            $statement->execute($params);
            return $statement;
        } catch (PDOException $e) {
            die("Sorgu hatası: " . $e->getMessage());
        }
    }

    public function select($sql, $params = [])
    {
        $statement = $this->query($sql, $params);
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    public function insert($table, $data)
    {
        $columns = implode(', ', array_keys($data));
        $values = ':' . implode(', :', array_keys($data));
        $sql = "INSERT INTO $table ($columns) VALUES ($values)";
        $this->query($sql, $data);
    }

    public function update($table, $data, $where)
    {
        $set = '';
        foreach ($data as $key => $value) {
            $set .= "$key = :$key, ";
        }
        $set = rtrim($set, ', ');

        $sql = "UPDATE $table SET $set WHERE $where";
        $this->query($sql, $data);
    }

    public function delete($table, $where)
    {
        $sql = "DELETE FROM $table WHERE $where";
        $this->query($sql);
    }

    public function getErrorInfo()
    {
        return $this->pdo->errorInfo();
    }

    public function getErrorCode()
    {
        return $this->pdo->errorCode();
    }

    public function isConnected()
    {
        return $this->connected;
    }
}


$db = new AhmDB();
date_default_timezone_set('Europe/Istanbul');
// if ($db->isConnected()) {
//     echo "Veritabanı bağlantısı başarıyla kuruldu.";
// } else {
//     echo "Veritabanı bağlantısı kurulamadı.";
// }


?>