# Knuth Rest-API

## Description

The Knuth Rest-API is a powerful RESTful service engineered with Node.js and Express. Its primary purpose is to facilitate seamless interaction with the Knuth Bitcoin Cash (BCH) blockchain. With its efficient use of the memory cache module, this API significantly enhances request efficiency and overall performance. Configuration details such as cache duration and server port are managed flexibly through environment variables.

## Setup and Installation

1. Clone this repository to your local machine.
2. Install dependencies with the command `npm install`.
3. Configure environment variables in the .env file for personalized settings: `cp .env.example .env`
3. Initiate the server using `npm start`.

## API Endpoints

The Knuth Rest-API encompasses various API endpoints corresponding to methods in the Chain class. These endpoints facilitate operations such as retrieving the last block height, block headers (by height or hash), specific blocks (by height or hash), transactions (by hash), and transaction positions (by hash).

## Usage Considerations

Please note that while this repository is fully functional, it's primarily configured for learning and exploration purposes. For production use, further optimization and security enhancements are recommended.

## Contributing

We welcome contributions from the developer community. If you're interested in enhancing the functionalities of the Knuth Rest-API or have some useful insights, feel free to submit a Pull Request or open an Issue on GitHub.
