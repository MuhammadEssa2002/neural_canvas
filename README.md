# Neural Canvas: MNIST Neural Network Visualizer

An interactive, browser-based visualization of a neural network recognizing handwritten digits. Draw a digit on the 28×28 board and watch the activations flow through every layer in real time, from the input pixels, through two hidden layers, to the final prediction.

Everything runs client-side using [p5.js](https://p5js.org/) for rendering and [Math.js](https://mathjs.org/) for the matrix math. The networks were trained in Python with NumPy, and their weights are loaded from JSON files, so the forward pass you see on screen is computed live in the browser.

**Live demo:** https://muhammadessa2002.github.io/neural_canvas/

## Features

- Draw digits on a 28×28 canvas with a soft, anti-aliased brush (MNIST-style input)
- Live forward pass: every neuron's activation is displayed and color-coded
- Connections light up according to the input pixels and layer activations
- Two pre-trained models you can switch between instantly
- Multiple selectable background themes
- Responsive canvas that scales to the window while preserving the layout
- Mouse and touch support

## Controls

| Key | Action |
|-----|--------|
| `c` | Clear the board |
| `1` | Switch to Model 1 |
| `2` | Switch to Model 2 |
| `f` | Cycle through backgrounds |

Draw by clicking and dragging inside the board on the left.

## Models

Both models are fully connected networks with the architecture `784 → hidden 1 → hidden 2 → 10`, using ReLU activations in the hidden layers. They were trained with plain gradient descent for 2,000 epochs.

| | Model 1 | Model 2 |
|---|---|---|
| Hidden layer sizes | 20 / 20 | 40 / 40 |
| Parameters | 16,330 | 33,450 |
| Output | Raw scores | Softmax probabilities |
| Loss function | Mean Squared Error | Cross-Entropy |
| Optimizer | Gradient Descent | Gradient Descent |
| Test accuracy | 92% | 96% |
| Training | NumPy (Python) | NumPy (Python) |

The predicted digit is the output neuron with the highest value. In the visualization, Model 2 draws its hidden layers as two columns of neurons to represent the wider layers.

## Getting Started

### Prerequisites

A modern web browser and a local web server. A server is required because the sketch loads the model weights and images with `fetch`-style requests, which browsers block when opening `index.html` directly from the file system.

### Run locally

```bash
# Clone the repository
git clone https://github.com/MuhammadEssa2002/neural_canvas.git
cd neural_canvas

# Start any static server, for example:
python -m http.server 8000
# or
npx serve
```

Then open `http://localhost:8000` in your browser.

p5.js and Math.js are loaded from the jsDelivr CDN, so an internet connection is needed on first load.

## Project Structure

```
.
├── index.html            # Page setup and script loading
├── sketch.js             # p5.js sketch: drawing board, input handling, scaling, controls
├── model_1.js            # Model 1 (MSE) forward pass and visualization
├── model_2.js            # Model 2 (softmax / cross-entropy) forward pass and visualization
├── mnist_model_1.json    # Trained weights and biases for Model 1
├── mnist_model_2.json    # Trained weights and biases for Model 2
├── assets/               # Background images (img_1.jpg ... img_4.jpg)
└── LICENSE
```

## How It Works

1. **Input.** The 28×28 board is stored as a Math.js matrix with values in `[0, 1]` and flattened into a 784×1 vector.
2. **Forward pass.** Each frame computes `Z = W·A + b` for every layer, applying ReLU in the hidden layers. Model 2 additionally applies softmax to the output layer.
3. **Rendering.** Neurons are drawn as rounded rectangles whose fill intensity reflects their activation, with the numeric value printed inside. Connection opacity is driven by input pixel intensity and layer outputs.
4. **Prediction.** The index of the largest output value is shown in the prediction box.

## Model Weight Format

Each JSON file is expected to contain the weights and biases of the three layers:

```json
{
  "L1": [[...]],  "b1": [[...]],
  "L2": [[...]],  "b2": [[...]],
  "L3": [[...]],  "b3": [[...]]
}
```

where `L1` has shape `(hidden1, 784)`, `L2` has shape `(hidden2, hidden1)`, `L3` has shape `(10, hidden2)`, and each bias is a column vector of matching height.

## Tech Stack

- [p5.js](https://p5js.org/) 1.11.10
- [Math.js](https://mathjs.org/) 14.0.1
- NumPy (training only)

## Possible Improvements

- Show the top-3 predictions with confidence bars
- Add a convolutional model for comparison
- Center and normalize drawn digits the way MNIST preprocessing does, to improve accuracy on off-center input

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

Muhammad Essa
