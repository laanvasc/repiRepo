package models

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.sql.Connection
import java.time.LocalDate
import java.util.UUID

class UserService(private val connection: Connection) {

    init {
        connection.createStatement().use { statement ->
            statement.executeUpdate(CREATE_TABLE_USUARIOS)
        }
    }

    // Create (Criar Usuário)
    suspend fun create(usuario: Usuarios): UUID = withContext(Dispatchers.IO) {
        connection.prepareStatement(INSERT_USUARIO).use { statement ->
            statement.setString(1, usuario.nome)
            statement.setString(2, usuario.email)
            statement.setString(3, usuario.passwordHash)
            statement.setString(4, usuario.avatarUrl)

            val resultSet = statement.executeQuery()
            if (resultSet.next()) {
                return@withContext UUID.fromString(resultSet.getString("id"))
            } else {
                throw Exception("Não foi possível recuperar o ID do usuário inserido.")
            }
        }
    }

    // Read (Buscar por ID)
    suspend fun read(id: UUID): Usuarios = withContext(Dispatchers.IO) {
        connection.prepareStatement(SELECT_USUARIO_BY_ID).use { statement ->
            statement.setString(1, id.toString())
            val resultSet = statement.executeQuery()

            if (resultSet.next()) {
                val name = resultSet.getString("name")
                val email = resultSet.getString("email")
                val passwordHash = resultSet.getString("password_hash")
                val xp = resultSet.getInt("xp")
                val level = resultSet.getInt("level")
                val ofensivaAtual = resultSet.getInt("ofensiva_atual")
                val recordeMaximo = resultSet.getInt("recorde_maximo")
                val dataUltimaAtividade = resultSet.getDate("data_ultima_atividade")?.toLocalDate()
                val avatarUrl = resultSet.getString("avatar_url")

                return@withContext Usuarios(
                    id = id,
                    nome = name,
                    email = email,
                    passwordHash = passwordHash,
                    xp = xp,
                    level = level,
                    ofensivaAtual = ofensivaAtual,
                    recordeMaximo = recordeMaximo,
                    dataUltimaAtividade = dataUltimaAtividade,
                    avatarUrl = avatarUrl
                )
            } else {
                throw Exception("Usuário não encontrado.")
            }
        }
    }

    // Update (Atualizar Perfil Básico)
    suspend fun update(id: UUID, usuario: Usuarios) = withContext(Dispatchers.IO) {
        connection.prepareStatement(UPDATE_USUARIO_PERFIL).use { statement ->
            statement.setString(1, usuario.nome)
            statement.setString(2, usuario.email)
            statement.setString(3, usuario.avatarUrl)
            statement.setString(4, id.toString())

            val rowsAffected = statement.executeUpdate()
            if (rowsAffected == 0) {
                throw Exception("Nenhum usuário foi atualizado. ID não encontrado.")
            }
        }
    }

    // Update (Atualizar XP e Nível)
    suspend fun updateXpENivel(id: UUID, xp: Int, level: Int) = withContext(Dispatchers.IO) {
        connection.prepareStatement(UPDATE_USUARIOS_XP_E_NIVEL).use { statement ->
            statement.setInt(1, xp)
            statement.setInt(2, level)
            statement.setString(3, id.toString())

            val rowsAffected = statement.executeUpdate()
            if (rowsAffected == 0) {
                throw Exception("Falha ao atualizar XP/Nível. ID não encontrado.")
            }
        }
    }

    // Update (Atualizar Ofensiva/Streak)
    suspend fun updateOfensiva(id: UUID, ofensivaAtual: Int, recordeMaximo: Int, dataUltimaAtividade: LocalDate) = withContext(Dispatchers.IO) {
        connection.prepareStatement(UPDATE_USUARIOS_OFENSIVA).use { statement ->
            statement.setInt(1, ofensivaAtual)
            statement.setInt(2, recordeMaximo)
            statement.setString(3, dataUltimaAtividade.toString())
            statement.setString(4, id.toString())

            val rowsAffected = statement.executeUpdate()
            if (rowsAffected == 0) {
                throw Exception("Falha ao atualizar ofensiva. ID não encontrado.")
            }
        }
    }

    // Delete (Remover Usuário)
    suspend fun delete(id: UUID) = withContext(Dispatchers.IO) {
        connection.prepareStatement(DELETE_USUARIO_BY_ID).use { statement ->
            statement.setString(1, id.toString())

            val rowsAffected = statement.executeUpdate()
            if (rowsAffected == 0) {
                throw Exception("Nenhum usuário foi removido. ID não encontrado.")
            }
        }
    }

    companion object {
        private const val CREATE_TABLE_USUARIOS = """
            CREATE TABLE IF NOT EXISTS Usuarios (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                xp INT NOT NULL DEFAULT 0 CHECK (xp >= 0),
                level INT NOT NULL DEFAULT 1 CHECK (level >= 1),
                ofensiva_atual INT NOT NULL DEFAULT 0 CHECK (ofensiva_atual >= 0),
                recorde_maximo INT NOT NULL DEFAULT 0 CHECK (recorde_maximo >= 0),
                data_ultima_atividade DATE,
                avatar_url VARCHAR(500),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """

        private const val SELECT_USUARIO_BY_ID =
            "SELECT * FROM Usuarios WHERE id = ?::uuid;"

        private const val INSERT_USUARIO =
            "INSERT INTO Usuarios (name, email, password_hash, avatar_url) VALUES (?, ?, ?, ?) RETURNING id;"

        private const val UPDATE_USUARIO_PERFIL =
            "UPDATE Usuarios SET name = ?, email = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?::uuid;"

        private const val UPDATE_USUARIOS_XP_E_NIVEL =
            "UPDATE Usuarios SET xp = ?, level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?::uuid;"

        private const val UPDATE_USUARIOS_OFENSIVA = """
            UPDATE Usuarios 
            SET ofensiva_atual = ?, 
                recorde_maximo = ?, 
                data_ultima_atividade = ?::date, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?::uuid;
        """

        private const val DELETE_USUARIO_BY_ID =
            "DELETE FROM Usuarios WHERE id = ?::uuid;"
    }
}