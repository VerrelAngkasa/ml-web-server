const Hapi = require('@hapi/hapi');
const { loadModel, predict } = require('./inference');
const { imag } = require('@tensorflow/tfjs-node');

(async () => {

    // Load and Get ML model
    const model = await loadModel();
    console.log('model loaded!');

    //Initializing HTTP server
    const server = Hapi.server({
        host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
        port: 3000
    });

    server.route({
        method: 'POST',
        path: '/predicts',
        handler: async (request) => {
            // Get image that uploaded by user
            const { image } = request.payload;

            // Do and get prediction  result by giving model and image
            const predictions = await predict(model, image);

            // Get prediction result
            const [paper, rock] = predictions;

            if (paper) {
                return { result: 'paper' }
            }

            if (rock) {
                return { result: 'rock' };
            }

            return { result: 'scissors' };
        },
        // Make request payload as `multipart/form-data` to accept file upload
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
            }
        },
    });

    await server.start();

    console.log(`Server start at: ${server.info.uri}`);
})();