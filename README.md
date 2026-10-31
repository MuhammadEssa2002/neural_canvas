<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]



<!-- PROJECT HEADER -->
<br />
<div align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="assets/no_bg_logo.png" alt="Logo" width="550" height="300">
  </a>
  <h3 align="center">Neural Canvas: MNIST Neural Network Visualizer</h3>

  <p align="center">
    An interactive, browser-based visualization of neural networks recognizing handwritten digits.
    <br />
    <a href="https://github.com/MuhammadEssa2002/neural_canvas"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://muhammadessa2002.github.io/neural_canvas/">View Demo</a>
    &middot;
    <a href="https://github.com/MuhammadEssa2002/neural_canvas/issues/new?labels=bug">Report Bug</a>
    &middot;
    <a href="https://github.com/MuhammadEssa2002/neural_canvas/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#features">Features</a></li>
        <li><a href="#models">Models</a></li>
        <li><a href="#accuracy-and-limitations">Accuracy and Limitations</a></li>
        <li><a href="#how-it-works">How It Works</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#controls">Controls</a></li>
        <li><a href="#project-structure">Project Structure</a></li>
        <li><a href="#model-weight-format">Model Weight Format</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Neural Canvas Screen Shot][product-screenshot]](https://muhammadessa2002.github.io/neural_canvas/)

Draw a digit on the 28×28 board and watch the activations flow through every layer in real time, from the input pixels, through the hidden layers, to the final prediction.

Everything runs client-side using [p5.js](https://p5js.org/) for rendering and [Math.js](https://mathjs.org/) for the matrix math. The networks were trained in Python (NumPy and JAX), and their weights are loaded from JSON files, so the forward pass you see on screen is computed live in the browser.

**Live demo:** https://muhammadessa2002.github.io/neural_canvas/

### Features

* Draw digits on a 28×28 canvas with a soft, anti-aliased brush (MNIST-style input)
* Live forward pass: every neuron's activation is displayed and color-coded
* Connections light up according to the input pixels and layer activations
* Three pre-trained models you can switch between instantly, including one for Eastern Arabic-Indic digits (٠ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩)
* Toggleable neuron shadows and network connection lines
* Multiple selectable backgrounds
* Responsive canvas that scales to the window while preserving the layout
* Mouse and touch support

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Models

All models are fully connected networks using ReLU activations in the hidden layers and trained with plain gradient descent for 2,000 epochs.

| | Model 1 | Model 2 | Model 3 |
|---|---|---|---|
| Digit set | Western Arabic numerals (0-9) | Western Arabic numerals (0-9) | Eastern Arabic-Indic numerals (٠-٩) |
| Architecture | 784 → 20 → 20 → 10 | 784 → 40 → 40 → 10 | 784 → 20 → 20 → 15 → 10 |
| Hidden layers | 2 | 2 | 3 |
| Parameters | 16,330 | 33,450 | 16,595 |
| Output | Raw scores | Softmax probabilities | Softmax probabilities |
| Loss function | Mean Squared Error | Cross-Entropy | Cross-Entropy |
| Optimizer | Vanilla Gradient Descent | Vanilla Gradient Descent | Vanilla Gradient Descent |
| Test accuracy | 92% | 96% | 96% |
| Training | NumPy (Python) | NumPy (Python) | JAX (Python) |

The predicted digit is the output neuron with the highest value. In the visualization, Model 2 draws its hidden layers as two columns of neurons to represent the wider layers, and Model 3 shows the additional third hidden layer and renders its prediction in Eastern Arabic-Indic script using the Noto Naskh Arabic font.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Accuracy and Limitations

Models 1 and 2 were trained on the MNIST handwritten digit dataset, and Model 3 was trained on a handwritten Eastern Arabic-Indic digit dataset in the same 28×28 format. The test accuracies reported above (roughly 92% to 96%) were measured on held-out test images from those datasets.

Real-time drawing on the board can behave differently from those test results. Digits drawn with a mouse or finger are often thicker, thinner, smaller, larger or more off-center than the images the models were trained on, and the brush has its own look compared to scanned handwriting. Because of this, the models may produce unexpected predictions or fluctuating values while you draw, and they will often be less accurate in the browser than their test accuracy suggests. This project is meant as a visual way to understand how a network works, not as a production-grade digit recognizer.

For best results, draw the digit large, centered and with a single clear stroke, similar to MNIST samples.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### How It Works

1. **Input.** The 28×28 board is stored as a Math.js matrix with values in `[0, 1]` and flattened into a 784×1 vector.
2. **Forward pass.** Each frame computes `Z = W·A + b` for every layer, applying ReLU in the hidden layers. Models 2 and 3 additionally apply softmax to the output layer.
3. **Rendering.** Neurons are drawn as rounded rectangles whose fill intensity reflects their activation, with the numeric value printed inside. Connection opacity is driven by input pixel intensity and layer outputs. Everything is drawn in a fixed 1600×900 design space that is scaled to fit the window.
4. **Prediction.** The index of the largest output value is shown in the prediction box (as an Eastern Arabic-Indic digit for Model 3).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![JavaScript][JavaScript]][JavaScript-url]
* [![p5.js][p5.js]][p5-url] 
* [![Math.js][Math.js]][Mathjs-url] 
* [![Python][Python]][Python-url]
* [![NumPy][NumPy]][NumPy-url] 
* [![JAX][JAX]][JAX-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

A modern web browser and a local web server. A server is required because the sketch loads the model weights, fonts and images through p5.js `preload()`, which browsers block when opening `index.html` directly from the file system.

p5.js and Math.js are loaded from the jsDelivr CDN, so an internet connection is needed on first load.

* Python (for `http.server`) or Node.js (for `npx serve`), either one will do

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/MuhammadEssa2002/neural_canvas.git
   ```
2. Move into the project folder
   ```sh
   cd neural_canvas
   ```
3. Start any static server, for example:
   ```sh
   python -m http.server 8000
   ```
   or
   ```sh
   npx serve
   ```
4. Open `http://localhost:8000` in your browser

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Draw by clicking and dragging inside the board on the left. The network on the right updates live as you draw.

_Try the [live demo](https://muhammadessa2002.github.io/neural_canvas/) to see it in action._

### Controls

| Key | Action |
|-----|--------|
| `c` | Clear the board |
| `1` | Switch to Model 1 |
| `2` | Switch to Model 2 |
| `3` | Switch to Model 3 |
| `f` | Cycle through backgrounds |
| `s` | Turn neuron shadows on / off |
| `l` | Turn network connection lines on / off |

### Project Structure

```
.
├── index.html            # Page setup and script loading
├── sketch.js             # p5.js sketch: drawing board, input handling, scaling, controls
├── model_1.js            # Model 1 (MSE) forward pass and visualization
├── model_2.js            # Model 2 (softmax / cross-entropy) forward pass and visualization
├── model_3.js            # Model 3 (Eastern Arabic-Indic digits, 3 hidden layers) forward pass and visualization
├── mnist_model_1.json    # Trained weights and biases for Model 1
├── mnist_model_2.json    # Trained weights and biases for Model 2
├── mnist_model_3.json    # Trained weights and biases for Model 3
├── fonts/                # Roboto-Regular.ttf, NotoNaskhArabic-Regular.ttf
├── assets/               # Background images (img_1.jpg ... img_5.jpg)
└── LICENSE
```

### Model Weight Format

Each JSON file contains the weights and biases of every layer. Models 1 and 2 have three layers:

```json
{
  "L1": [[...]],  "b1": [[...]],
  "L2": [[...]],  "b2": [[...]],
  "L3": [[...]],  "b3": [[...]]
}
```

Model 3 has a fourth layer:

```json
{
  "L1": [[...]],  "b1": [[...]],
  "L2": [[...]],  "b2": [[...]],
  "L3": [[...]],  "b3": [[...]],
  "L4": [[...]],  "b4": [[...]]
}
```

Each `Ln` has shape `(neurons in layer n, neurons in layer n-1)`, with the first layer taking the 784 input pixels and the last layer producing 10 outputs. Each bias is a column vector of matching height.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [ ] Show the top-3 predictions with confidence bars
- [ ] Add a convolutional model for comparison
- [ ] Center and normalize drawn digits the way MNIST preprocessing does, to improve accuracy on off-center input

See the [open issues](https://github.com/MuhammadEssa2002/neural_canvas/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you want to train a model on your own data, such as MNIST digits again with a different architecture, or digits and alphabets from your own language or script, and see it animated in the same way, you can add it to this project:

1. Train your model on 28×28 grayscale inputs and export the weights and biases to a JSON file in the format described in [Model Weight Format](#model-weight-format). To keep the project consistent, please follow these rules:
   - Train using only NumPy, JAX or MATLAB.
   - Use no more than 3 hidden layers.
   - Use no more than 40 neurons in each hidden layer.
   - Implement the forward pass with plain matrix multiplication (`Z = W·A + b`), the same way the existing models do in Math.js.
2. Fork the repository and add your JSON file (for example `mnist_model_4.json`) to the project root.
3. Create a new `model_4.js` by copying the closest existing model file (`model_1.js`, `model_2.js` or `model_3.js`) and adjusting the layer sizes, neuron positions, labels and info text to match your network. If your output labels are not digits, map the predicted index to your own characters, as `model_3.js` does with `toArabicDigit`. Include any font your script needs in the `fonts/` folder.
4. Register the model in `index.html` (script tag), and in `sketch.js` (load the JSON in `preload()`, create the model in `setup()`, call its `draw()` in `draw()`, and add a key in `keyPressed()` to switch to it).
5. Update the [Models](#models) table in this README with your model's architecture, parameter count, loss function, optimizer and test accuracy.
6. Open a pull request with a short description of the dataset and how you trained the model.

Please keep the JavaScript integration consistent with the existing models so the visualization stays easy to maintain. Bug reports and improvement ideas are also welcome as issues.

If you have a general suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Top contributors:

<a href="https://github.com/MuhammadEssa2002/neural_canvas/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=MuhammadEssa2002/neural_canvas" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Muhammad Essa - [@MuhammadEssa2002](https://github.com/MuhammadEssa2002)

Project Link: [https://github.com/MuhammadEssa2002/neural_canvas](https://github.com/MuhammadEssa2002/neural_canvas)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [p5.js](https://p5js.org/)
* [Math.js](https://mathjs.org/)
* [NumPy](https://numpy.org/)
* [JAX](https://github.com/jax-ml/jax)
* [Noto Naskh Arabic font](https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic)
* [MNIST handwritten digit database](http://yann.lecun.com/exdb/mnist/)
* [Best-README-Template](https://github.com/othneildrew/Best-README-Template)
* [Img Shields](https://shields.io)
* [GitHub Pages](https://pages.github.com)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/MuhammadEssa2002/neural_canvas.svg?style=for-the-badge
[contributors-url]: https://github.com/MuhammadEssa2002/neural_canvas/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/MuhammadEssa2002/neural_canvas.svg?style=for-the-badge
[forks-url]: https://github.com/MuhammadEssa2002/neural_canvas/network/members
[stars-shield]: https://img.shields.io/github/stars/MuhammadEssa2002/neural_canvas.svg?style=for-the-badge
[stars-url]: https://github.com/MuhammadEssa2002/neural_canvas/stargazers
[issues-shield]: https://img.shields.io/github/issues/MuhammadEssa2002/neural_canvas.svg?style=for-the-badge
[issues-url]: https://github.com/MuhammadEssa2002/neural_canvas/issues
[license-shield]: https://img.shields.io/github/license/MuhammadEssa2002/neural_canvas.svg?style=for-the-badge
[license-url]: https://github.com/MuhammadEssa2002/neural_canvas/blob/main/LICENSE
[product-screenshot]: assets/screenshot.png
[p5.js]: https://img.shields.io/badge/p5.js-ED225D?style=for-the-badge&logo=p5dotjs&logoColor=white
[p5-url]: https://p5js.org/
[Math.js]: https://img.shields.io/badge/Math.js-1F2937?style=for-the-badge
[Mathjs-url]: https://mathjs.org/
[JavaScript]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[JavaScript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[NumPy]: https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white
[NumPy-url]: https://numpy.org/
[JAX]: https://img.shields.io/badge/JAX-5E97F6?style=for-the-badge
[JAX-url]: https://github.com/jax-ml/jax
[Python]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://www.python.org/
