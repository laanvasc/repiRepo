package com.example.repiRepo

import io.ktor.server.application.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation

//isso mexe com a conversão em json não mexer
fun Application.configureSerialization() {
    install(ContentNegotiation) {
        json()
    }
}