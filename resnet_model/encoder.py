"""
Implements image encoders
"""
import torch
from torch import nn
import torch.nn.functional as F
import torchvision
import util
from custom_encoder import ConvEncoder
import torch.autograd.profiler as profiler

import os
import os.path as osp
from glob import glob
import random
import cv2
import numpy as np
import numpy.linalg as LA
import torch
from torch.utils.data import Dataset
from PIL import Image
from torch.utils.data import DataLoader
import torch.nn.functional as F
import matplotlib.pyplot as plt


class ImageEncoder(nn.Module):
    """
    Global image encoder
    """

    def __init__(self, backbone="resnet34", pretrained=True, latent_size=128):
        """
        :param backbone Backbone network. Assumes it is resnet*
        e.g. resnet34 | resnet50
        :param num_layers number of resnet layers to use, 1-5
        :param pretrained Whether to use model pretrained on ImageNet
        """
        super().__init__()
        self.model = getattr(torchvision.models, backbone)(pretrained=pretrained)
        self.model.fc = nn.Sequential()
        self.register_buffer("latent", torch.empty(1, 1), persistent=False)
        # self.latent (B, L)
        self.latent_size = latent_size
        if latent_size != 512:
            self.fc = nn.Linear(512, latent_size)

    def forward(self, x):
        """
        For extracting ResNet's features.
        :param x image (B, C, H, W)
        :return latent (B, latent_size)
        """
        x = x.to(device=self.latent.device)
        x = self.model.conv1(x)
        x = self.model.bn1(x)
        x = self.model.relu(x)

        x = self.model.maxpool(x)
        x = self.model.layer1(x)
        x = self.model.layer2(x)
        x = self.model.layer3(x)
        x = self.model.layer4(x)

        # x = self.model.avgpool(x)
        # x = torch.flatten(x, 1)

        # if self.latent_size != 512:
        #     x = self.fc(x)

        # self.latent = x  # (B, latent_size)
        return x

    @classmethod
    def from_conf(cls, conf):
        return cls(
            conf.get_string("backbone"),
            pretrained=conf.get_bool("pretrained", True),
            latent_size=conf.get_int("latent_size", 128),
        )

if __name__ == '__main__':

    # image 
    image_path = '/home/junyingw/Downloads/Screenshots-20230224T014636Z-001/Screenshots/wasm___continuation-labs___com/d3demo/Chrome/WebAssembly_Enabled/screenshot.jpeg'
    image= Image.open(image_path).convert('RGB')
    image = image.resize((512, 512))
    image = (np.array(image)/255.).astype(np.float32)
    image = torch.as_tensor(image).float().permute(2,0,1)
    image = image.unsqueeze(0).to(device='cuda:0')

    encoder = ImageEncoder(backbone="resnet34", pretrained=True, latent_size=512)
    out_feat = encoder(image)

    # image feature map visualization
    # img_feat_list = model.module.visualization(image)
    # visualize 64 features from each layer 
    # (although there are more feature maps in the upper layers)
    # for num_layer in range(len(out_feat)):
    plt.figure(figsize=(10, 10))
    layer_viz = out_feat[0, :, :, :]
    layer_viz = layer_viz.detach().cpu()
    layer_viz = layer_viz.data

    print('vis is:', layer_viz.shape)

    for i, filter_ in enumerate(layer_viz):
        print('filter_ is:', filter_.shape)

        if i == 4: # we will visualize only 8x8 blocks from each layer
            break
        plt.subplot(2, 2, i + 1)
        plt.imshow(filter_, cmap='binary')
        plt.axis('off')
        # print(f"Saving layer {num_layer} feature maps...")
        # save_feat_path = os.path.join(opt.logs_path, opt.expname, folder_name, sub_id, 'layer_{}_{}.png'.format(sub_id, num_layer))
        # plt.savefig(save_feat_path)
    plt.show()
    plt.close()

    print('image is:', image.shape)
    print('out feat is:', out_feat.shape)

    