import { BluefoxClient } from "bluefox-email";

const client = new BluefoxClient({
  apiKey: process.env.BLUEFOX_API_KEY!,
  debug: true,
});

async function testBluefox() {
  try {
    // Test subscriber management
    const addResult = await client.subscriber.add(
      "test-list-id",
      "Test User",
      "test@example.com"
    );

    if (addResult.ok) {
      const subscriber = addResult.value.data;
      console.log("Successfully added subscriber:", subscriber);

      // Test pausing the subscriber
      const pauseResult = await client.subscriber.pause(
        "test-list-id",
        subscriber.email,
        new Date(Date.now() + 24 * 60 * 60 * 1000) // Pause for 24 hours
      );

      if (pauseResult.ok) {
        console.log("Successfully paused subscriber:", pauseResult.value.data);
      }
    } else {
      console.error("Failed to add subscriber:", addResult.error.message);
      return;
    }

    // Test sending a transactional email
    const emailResult = await client.email.sendTransactional({
      to: "test@example.com",
      transactionalId: "welcome-email",
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
      console.log("Successfully sent email:", email);
      console.log("Email status:", email.status);
      if (email.deliveredAt) {
        console.log(
          "Delivered at:",
          new Date(email.deliveredAt).toLocaleString()
        );
      }
    } else {
      console.error("Failed to send email:", emailResult.error.message);
      if (emailResult.error.details) {
        console.error("Error details:", emailResult.error.details);
      }
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);
    }
  }
}

console.log(`RUNNING testBluefox() next:`);

// Add proper error handling for the main function
testBluefox().catch((error: unknown) => {
  console.error("Fatal error in testBluefox:", error);
  process.exit(1);
});
