from datasets import load_dataset
from sentence_transformers import (
    SentenceTransformer,
    SentenceTransformerTrainer,
    SentenceTransformerTrainingArguments,
)

from sentence_transformers.sentence_transformer import losses

# 1. Load the pretrained multilingual E5 model
model = SentenceTransformer("intfloat/multilingual-e5-small")

# 2. Load the SchemeSetu contrastive dataset
dataset = load_dataset(
    "csv",
    data_files=r"E:\SIH PROTOTPYE\schemesetu_e5_v2"
)["train"]

# 3. Keep only the 3 columns required by ContrastiveLoss
dataset = dataset.select_columns(["sentence1", "sentence2", "label"])

# 4. Contrastive loss
train_loss = losses.ContrastiveLoss(model)

# 5. CPU-friendly training settings
args = SentenceTransformerTrainingArguments(
    output_dir="./schemesetu_e5_finetuned_v2",
    num_train_epochs=2,
    per_device_train_batch_size=8,
    learning_rate=2e-5,
    warmup_steps=139,
    logging_steps=10,
    save_strategy="epoch",
    save_total_limit=1,
    report_to="none",
)

# 6. Trainer
trainer = SentenceTransformerTrainer(
    model=model,
    args=args,
    train_dataset=dataset,
    loss=train_loss,
)

print("Starting SchemeSetu multilingual fine-tuning...")
print("Training examples:", len(dataset))

# 7. Train
trainer.train()

# 8. Save the fine-tuned model
model.save_pretrained("./schemesetu_e5_final")

print("\nTraining completed successfully!")
print("Model saved to: ./schemesetu_e5_final")