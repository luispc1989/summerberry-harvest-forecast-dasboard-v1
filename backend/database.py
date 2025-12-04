import mysql.connector
from mysql.connector import Error
from contextlib import contextmanager
from config import get_settings


settings = get_settings()


def get_db_connection():
    """Create a MariaDB connection."""
    try:
        connection = mysql.connector.connect(
            host=settings.db_host,
            port=settings.db_port,
            user=settings.db_user,
            password=settings.db_password,
            database=settings.db_name
        )
        return connection
    except Error as e:
        print(f"Error connecting to MariaDB: {e}")
        raise


@contextmanager
def get_db_cursor():
    """Context manager for database operations."""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        yield cursor
        connection.commit()
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()


def test_connection() -> bool:
    """Test if database connection is working."""
    try:
        connection = get_db_connection()
        connection.close()
        return True
    except:
        return False
