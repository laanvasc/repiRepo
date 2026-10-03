package models

import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import java.time.LocalDate
import java.util.UUID

// Serializer para tratar a conversão de LocalDate em JSON (String ISO-8601: "YYYY-MM-DD")
object LocalDateSerializer : KSerializer<LocalDate> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("LocalDate", PrimitiveKind.STRING)
    override fun serialize(encoder: Encoder, value: LocalDate) = encoder.encodeString(value.toString())
    override fun deserialize(decoder: Decoder): LocalDate = LocalDate.parse(decoder.decodeString())
}

@Serializable
data class Usuarios(
    @Serializable(with = UUIDSerializer::class)
    val id: UUID? = null,
    val nome: String,
    val email: String,
    val passwordHash: String,
    val xp: Int = 0,
    val level: Int = 1,
    val ofensivaAtual: Int = 0,
    val recordeMaximo: Int = 0,
    @Serializable(with = LocalDateSerializer::class)
    val dataUltimaAtividade: LocalDate? = null,
    val avatarUrl: String? = null
)