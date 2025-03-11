import { BluefoxClient } from "bluefox-email";
import { DEBUG, ERROR } from "@bluefox-email/utils";
import { getEnv } from "./utils.js";

const SUBSCRIPTION_LIST = getEnv("SUBSCRIPTION_LIST");
const EMAIL_ADDRESS = getEnv("EMAIL_ADDRESS");
const TRANSACTIONAL_ID = getEnv("TRANSACTIONAL_ID");

const client = new BluefoxClient({
  apiKey: getEnv("API_KEY"),
  debug: false,
});

async function testSubscriptionManagement() {
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

        const activeResult = await client.subscriber.activate(
          SUBSCRIPTION_LIST,
          EMAIL_ADDRESS
        );

        if (activeResult.ok) {
          const activate = activeResult.value.data;
          DEBUG("SubscriberActivated", activate, 10);
        } else {
          ERROR("ActiveSubscriberError", {
            error: activeResult.error,
            details: {
              list: SUBSCRIPTION_LIST,
              email: EMAIL_ADDRESS,
              response: activeResult.error.details,
            },
          });
        }
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
    }
  } catch (error) {
    ERROR("UnexpectedError", {
      error,
      details: {
        phase: "subscription management",
        lastOperation: "add or pause subscriber",
      },
    });
  }
}

async function testTransactionalEmail() {
  try {
    // Test sending a transactional email
    const emailResult = await client.email.sendTransactional({
      to: EMAIL_ADDRESS,
      transactionalId: TRANSACTIONAL_ID,
      data: {
        name: "Test User",
        welcomeMessage: "Welcome to our service!",
      },
      attachments: [
        {
          fileName: "welcome.txt",
          content: Buffer.from("Welcome to our service!").toString("base64"),
        },
      ],
    });

    if (emailResult.ok) {
      const email = emailResult.value.data;
      DEBUG(
        "EmailSent",
        {
          email,
          status: email.status,
          deliveredAt: email.deliveredAt
            ? new Date(email.deliveredAt).toLocaleString()
            : null,
        },
        10
      );
    } else {
      ERROR("SendEmailError", {
        error: emailResult.error,
        details: {
          response: emailResult,
          requestData: {
            to: EMAIL_ADDRESS,
            transactionalId: TRANSACTIONAL_ID,
          },
          error: emailResult.error.details,
        },
      });
    }
  } catch (error) {
    ERROR("UnexpectedError", {
      error,
      details: {
        phase: "transactional email testing",
        lastOperation: "send email",
      },
    });
  }
}

async function testSubscriptionList() {
  const data = await client.subscriber.list(SUBSCRIPTION_LIST);
  if (data.ok) {
    DEBUG("SUBSCRIBER LIST", data.value.data, 20);
  } else {
    ERROR("SUBSCRIBER LIST ERROR", data.error);
  }
}

async function runTests() {
  // await testSubscriptionManagement();
  // await testTransactionalEmail();
  // await testSubscriptionList()
}

runTests().catch((error: unknown) => {
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
