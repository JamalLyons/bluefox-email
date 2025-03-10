import "dotenv/config";
import { BluefoxClient } from "bluefox-email";
import { DEBUG, ERROR } from "@bluefox-email/utils";

let API_KEY: string;

if (!process.env.BLUEFOX_API_KEY) {
  throw new Error("ENV BLUEFOX_API_KEY REQUIRED FOR THIS TEST");
} else {
  API_KEY = process.env.BLUEFOX_API_KEY;
}

let SUBSCRIPTION_LIST: string;

if (!process.env.SUBSCRIBER_LIST) {
  throw new Error("ENV SUBSCRIBER_LIST REQUIRED FOR THIS TEST");
} else {
  SUBSCRIPTION_LIST = process.env.SUBSCRIBER_LIST;
}

let EMAIL_ADDRESS: string;

if (!process.env.EMAIL_ADDRESS) {
  throw new Error("ENV EMAIL_ADDRESS REQUIRED FOR THIS TEST");
} else {
  EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
}

const client = new BluefoxClient({
  apiKey: API_KEY,
  debug: true,
});

async function testBluefox() {
  try {
    DEBUG(
      "TestConfig",
      {
        subscriptionList: SUBSCRIPTION_LIST,
        emailAddress: EMAIL_ADDRESS,
      },
      10
    );

    // Test subscriber management
    const addResult = await client.subscriber.add(
      SUBSCRIPTION_LIST,
      "Jamal Lyons",
      EMAIL_ADDRESS
    );

    if (addResult.ok) {
      const subscriber = addResult.value.data;
      DEBUG("SubscriberAdded", subscriber, 10);

      // Test pausing the subscriber
      const pauseResult = await client.subscriber.pause(
        SUBSCRIPTION_LIST,
        EMAIL_ADDRESS,
        new Date(Date.now() + 24 * 60 * 60 * 1000) // Pause for 24 hours
      );

      if (pauseResult.ok) {
        DEBUG("SubscriberPaused", pauseResult.value.data, 10);
      } else {
        ERROR("PauseSubscriberError", {
          error: pauseResult.error,
          details: {
            list: SUBSCRIPTION_LIST,
            email: EMAIL_ADDRESS,
            response: pauseResult.error.details,
          },
        });
      }
    } else {
      ERROR("AddSubscriberError", {
        error: addResult.error,
        details: {
          list: SUBSCRIPTION_LIST,
          email: EMAIL_ADDRESS,
          name: "Jamal Lyons",
          response: addResult.error.details,
        },
      });
      return;
    }

    // Test sending a transactional email
    // const emailResult = await client.email.sendTransactional({
    //   to: "test@example.com",
    //   transactionalId: "welcome-email",
    //   data: {
    //     name: "Test User",
    //     welcomeMessage: "Welcome to our service!",
    //   },
    //   attachments: [
    //     {
    //       fileName: "welcome.txt",
    //       content: Buffer.from("Welcome to our service!").toString("base64"),
    //     },
    //   ],
    // });

    // if (emailResult.ok) {
    //   const email = emailResult.value.data;
    //   DEBUG("EmailSent", {
    //     email,
    //     status: email.status,
    //     deliveredAt: email.deliveredAt ? new Date(email.deliveredAt).toLocaleString() : null
    //   }, 10);
    // } else {
    //   ERROR("SendEmailError", {
    //     error: emailResult.error,
    //     details: {
    //       response: emailResult,
    //       requestData: {
    //         to: "test@example.com",
    //         transactionalId: "welcome-email"
    //       }
    //     }
    //   });
    // }
  } catch (error) {
    ERROR("UnexpectedError", {
      error,
      details: {
        phase: "test execution",
        lastOperation: "subscriber management",
      },
    });
  }
}

testBluefox().catch((error: unknown) => {
  ERROR("FatalError", {
    error,
    details: {
      phase: "test initialization",
      environmentVars: {
        hasApiKey: !!process.env.BLUEFOX_API_KEY,
        hasSubscriberList: !!process.env.SUBSCRIBER_LIST,
        hasEmailAddress: !!process.env.EMAIL_ADDRESS,
      },
    },
  });
  process.exit(1);
});
