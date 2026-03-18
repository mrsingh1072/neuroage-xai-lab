import torch
import torch.nn as nn
import timm

class ViTRegressor(nn.Module):
    def __init__(self):
        super(ViTRegressor, self).__init__()

        # Load pretrained ViT
        self.vit = timm.create_model('vit_base_patch16_224', pretrained=True)

        # Replace classification head with regression head
        in_features = self.vit.head.in_features
        self.vit.head = nn.Linear(in_features, 1)

    def forward(self, x):
        return self.vit(x)



def load_vit_model():
    try:
        model = ViTRegressor()   # ✅ USE YOUR CLASS

        model.eval()
        print("✅ ViT model loaded successfully")

        return model

    except Exception as e:
        print("❌ ViT load error:", str(e))
        return None


def predict_vit(model, image_tensor):
    device = next(model.parameters()).device
    image_tensor = image_tensor.to(device)

    with torch.no_grad():
        output = model(image_tensor)

    age = output.squeeze().item()   # ✅ safer

    return age