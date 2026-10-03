package models

import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import java.time.Instant
import java.util.UUID

// Serializers de conversão para JSON
object UUIDSerializer : KSerializer<UUID> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("UUID", PrimitiveKind.STRING)
    override fun serialize(encoder: Encoder, value: UUID) = encoder.encodeString(value.toString())
    override fun deserialize(decoder: Decoder): UUID = UUID.fromString(decoder.decodeString())
}

object InstantSerializer : KSerializer<Instant> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("Instant", PrimitiveKind.STRING)
    override fun serialize(encoder: Encoder, value: Instant) = encoder.encodeString(value.toString())
    override fun deserialize(decoder: Decoder): Instant = Instant.parse(decoder.decodeString())
}

// 1. Exercise
@Serializable
data class Exercise(
    @Serializable(with = UUIDSerializer::class)
    val id: UUID? = null,
    val name: String,
    val description: String? = null,
    val muscleGroup: String,
    val equipment: String? = null,
    val demoMediaUrl: String? = null,
    val isActive: Boolean = true,
    @Serializable(with = InstantSerializer::class)
    val createdAt: Instant? = null
)

// 2. Workout
@Serializable
data class Workout(
    @Serializable(with = UUIDSerializer::class)
    val id: UUID? = null,
    @Serializable(with = UUIDSerializer::class)
    val userId: UUID,
    val title: String,
    val description: String? = null,
    @Serializable(with = InstantSerializer::class)
    val createdAt: Instant? = null,
    @Serializable(with = InstantSerializer::class)
    val updatedAt: Instant? = null
)

// 3. WorkoutExercise
@Serializable
data class WorkoutExercise(
    @Serializable(with = UUIDSerializer::class)
    val id: UUID? = null,
    @Serializable(with = UUIDSerializer::class)
    val workoutId: UUID,
    @Serializable(with = UUIDSerializer::class)
    val exerciseId: UUID,
    val sequenceOrder: Int,
    val targetSets: Int = 3,
    val targetRepsMin: Int? = null,
    val targetRepsMax: Int? = null,
    val targetWeightKg: Double? = null,
    val restSeconds: Int = 60
)

// 4. WorkoutLog
@Serializable
data class WorkoutLog(
    @Serializable(with = UUIDSerializer::class)
    val id: UUID? = null,
    @Serializable(with = UUIDSerializer::class)
    val userId: UUID,
    @Serializable(with = UUIDSerializer::class)
    val workoutId: UUID? = null,
    @Serializable(with = InstantSerializer::class)
    val startedAt: Instant,
    @Serializable(with = InstantSerializer::class)
    val completedAt: Instant? = null,
    val durationSeconds: Int? = null,
    val xpEarned: Int = 0,
    val notes: String? = null
)

// 5. LogSet
@Serializable
data class LogSet(
    @Serializable(with = UUIDSerializer::class)
    val id: UUID? = null,
    @Serializable(with = UUIDSerializer::class)
    val workoutLogId: UUID,
    @Serializable(with = UUIDSerializer::class)
    val exerciseId: UUID,
    val setNumber: Int,
    val repsCompleted: Int,
    val weightKg: Double = 0.0,
    val rpe: Double? = null,
    @Serializable(with = InstantSerializer::class)
    val completedAt: Instant? = null
)