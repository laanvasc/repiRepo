package com.example.repiRepo.Schema


import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.sql.Connection
import models.Exercicio
import java.time.LocalDate
import java.util.UUID

class ExercicioService(private val connection: Connection) {
    init {
        connection.createStatement().use { statement ->
            statement.executeUpdate(CREATE_TABLE_EXERCICIOS)
        }
    }

    suspend fun createExercicio(exercicio: Exercicio): UUID = withContext(Dispatchers.IO) {

    }


}