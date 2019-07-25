// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Welcome, you can Read the text or LogIn with FIWARE. What do you prefer?';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const ReadIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ReadIntent';
    },
    handle(handlerInput) {
        const speechText = 'This is the title. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam interdum congue erat ut pulvinar. Nullam nec tincidunt nisi. Donec purus orci, vehicula ac imperdiet at, condimentum et risus. Mauris eget condimentum eros. Morbi nulla augue, placerat non nunc et, volutpat fermentum nulla. Ut elit mauris, dapibus eu quam vitae, sodales semper magna. In metus ex, fringilla vel libero interdum, facilisis ultricies nisl. Integer aliquam ipsum et libero feugiat finibus et quis nunc. Praesent aliquam sem vitae neque bibendum, ac elementum nisi vulputate. Aenean consequat sapien at metus tincidunt, ut vestibulum metus iaculis. Proin id sollicitudin sapien, ac semper ante. Nunc in pretium ante. Phasellus fermentum sagittis ante, a mattis mi condimentum a. Nunc sem diam, tempus eget ligula non, sollicitudin tincidunt ante. Nunc eget nibh feugiat magna dapibus efficitur vel id nisi. Maecenas porttitor luctus erat, at fermentum nisl dignissim in. Cras pellentesque, felis nec tempus mattis, justo dolor dignissim velit, ut ullamcorper magna quam quis mi. Quisque varius dictum viverra. Integer vitae eros at quam ullamcorper fermentum ac interdum ex. Mauris ultrices, est vitae ultrices tincidunt, nisi ex blandit odio, sit amet consectetur orci ante vitae tellus. Sed tortor nulla, maximus ut auctor nec, sodales a ante. Nam blandit dapibus ante, vitae luctus orci lacinia eget. Aenean vel enim luctus, bibendum elit ac, pharetra augue. Integer interdum mollis quam, quis rhoncus mi dictum et. Aliquam nibh eros, dictum id nulla at, dictum vestibulum enim. Sed ut mauris at libero rhoncus pharetra. Duis pharetra euismod velit, vitae fermentum orci malesuada sed. Duis nisl nisl, facilisis eu porttitor pretium, pretium in nunc. Proin eu hendrerit erat. Aliquam erat volutpat. Duis ut molestie erat. Fusce porta sem sapien, sed aliquam ante blandit ut. Cras fermentum eu nulla nec mollis. Quisque pharetra accumsan metus eget ullamcorper. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis erat ut iaculis placerat. Suspendisse ac leo eget risus aliquet tincidunt. Phasellus ullamcorper erat eu arcu fringilla condimentum. Vivamus id augue nibh. Integer consectetur arcu ipsum, et sodales metus faucibus vel. Vivamus aliquam enim sed vestibulum pulvinar. Nulla finibus elit lacus, eget blandit dolor egestas suscipit. Duis ultricies porttitor turpis, ut cursus neque sagittis at. Nunc mollis sit amet velit sit amet euismod. Phasellus ultrices pretium odio, eu interdum ligula tempor a. Quisque venenatis diam non purus ultrices, in hendrerit arcu accumsan. Sed pharetra quam eu fermentum tincidunt. Aenean fringilla bibendum mi, nec mattis dui rhoncus quis. Interdum et malesuada fames ac ante ipsum primis in faucibus. In tempor est est, ut tincidunt nisl molestie vel. Vivamus nec sapien lacinia, accumsan sapien nec, ultrices eros. Duis mollis diam et ante ornare, quis lacinia lectus facilisis. Morbi purus dui, scelerisque in ante in, ultricies lobortis lectus.';
        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `Sorry, I couldn't understand what you said. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ReadIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
