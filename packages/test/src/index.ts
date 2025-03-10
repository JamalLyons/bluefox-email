import "dotenv/config";
import { BluefoxClient } from "bluefox-email";

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
    // Test subscriber management
    const addResult = await client.subscriber.add(
      SUBSCRIPTION_LIST,
      "Jamal Lyons",
      EMAIL_ADDRESS
    );

    if (addResult.ok) {
      const subscriber = addResult.value.data;
      console.log("Successfully added subscriber:", subscriber);

      // Test pausing the subscriber
      const pauseResult = await client.subscriber.pause(
        SUBSCRIPTION_LIST,
        EMAIL_ADDRESS,
        new Date(Date.now() + 24 * 60 * 60 * 1000) // Pause for 24 hours
      );

      if (pauseResult.ok) {
        console.log("Successfully paused subscriber:", pauseResult.value.data);
      }
    } else {
      console.error("Failed to add subscriber:", addResult.error);
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
    //   console.log("Successfully sent email:", email);
    //   console.log("Email status:", email.status);
    //   if (email.deliveredAt) {
    //     console.log(
    //       "Delivered at:",
    //       new Date(email.deliveredAt).toLocaleString()
    //     );
    //   }
    // } else {
    //   console.error("Failed to send email:", emailResult.error.message);
    //   if (emailResult.error.details) {
    //     console.error("Error details:", emailResult.error.details);
    //   }
    // }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);
    }
  }
}

testBluefox().catch((error: unknown) => {
  console.error("Fatal error in testBluefox:", error);
  process.exit(1);
});
