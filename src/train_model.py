import os
import cv2
import numpy as np
from sklearn.model_selection import train_test_split
import torch
import torch.nn as nn
import torch.optim as optim

# -----------------------------
# LOAD DATA
# -----------------------------
data_path = "data/processed"

images = []
ages = []

for file in os.listdir(data_path):
    if file.endswith(".png"):
        img_path = os.path.join(data_path, file)
        
        # read image
        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        img = img / 255.0
        
        images.append(img)

        # extract age
        age = int(file.split("_age_")[1].split(".")[0])
        ages.append(age)

X = np.array(images)
y = np.array(ages)

# -----------------------------
# NORMALIZE AGE (IMPORTANT)
# -----------------------------
y = y / 100.0

# reshape
X = X.reshape(-1, 1, 224, 224)

# split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# convert to tensor
X_train = torch.tensor(X_train, dtype=torch.float32)
y_train = torch.tensor(y_train, dtype=torch.float32)

# -----------------------------
# CNN MODEL
# -----------------------------
class CNN(nn.Module):
    def __init__(self):
        super(CNN, self).__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(1, 16, 3),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(16, 32, 3),
            nn.ReLU(),
            nn.MaxPool2d(2)
        )
        self.fc = nn.Sequential(
            nn.Flatten(),
            nn.Linear(32 * 54 * 54, 128),
            nn.ReLU(),
            nn.Linear(128, 1)
        )

    def forward(self, x):
        x = self.conv(x)
        x = self.fc(x)
        return x

model = CNN()

criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# -----------------------------
# TRAINING
# -----------------------------
epochs = 20

for epoch in range(epochs):
    model.train()
    
    outputs = model(X_train)
    loss = criterion(outputs.squeeze(), y_train)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    print(f"Epoch {epoch+1}, Loss: {loss.item()}")

print("\nTraining complete!")

# -----------------------------
# TESTING
# -----------------------------
X_test = torch.tensor(X_test, dtype=torch.float32)
y_test = torch.tensor(y_test, dtype=torch.float32)

model.eval()
with torch.no_grad():
    predictions = model(X_test).squeeze()
    test_loss = criterion(predictions, y_test)

print(f"\nTest Loss: {test_loss.item()}")

# -----------------------------
# SAMPLE PREDICTION
# -----------------------------
sample = X_test[0].unsqueeze(0)

model.eval()
with torch.no_grad():
    pred = model(sample).item()

# convert back to real age
pred_age = pred * 100
actual_age = y_test[0].item() * 100

print(f"\nActual Age: {actual_age}")
print(f"Predicted Age: {pred_age}")

# -----------------------------
# SAVE MODEL
# -----------------------------
import os

os.makedirs("model", exist_ok=True)

torch.save(model.state_dict(), "backend/model/model.pth")

print("\nModel saved at model/model.pth")