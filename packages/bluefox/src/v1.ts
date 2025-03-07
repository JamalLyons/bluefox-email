import { V1 } from "@bluefox-email/api/v1";

export class BluefoxClient extends V1.BluefoxModule {
  public readonly subscriber: BluefoxSubscriber;

  constructor(config: V1.BluefoxClientConfig) {
    const context: V1.BluefoxContext = {
      config,
      baseUrl: "https://api.bluefox.email/v1",
    };

    super(context);

    // Automatically register submodules
    this.subscriber = new BluefoxSubscriber(context);
  }
}

class BluefoxSubscriber extends V1.BluefoxModule {
  constructor(context: V1.BluefoxContext) {
    super(context);
  }

  /**
   * Adds an email to a subscriber list
   * @param subscriberListId The ID of the subscriber list
   * @param name The name of the subscriber
   * @param email The email of the subscriber
   *
   * https://bluefox.email/docs/api/subscriber-list-management#subscribe
   */
  async add(subscriberListId: string, name: string, email: string) {
    if (!subscriberListId || !name || !email) {
      throw new V1.BluefoxError(
        "Missing required fields: subscriberListId, name, email",
        V1.BluefoxErrorCodes.BAD_REQUEST
      );
    }

    const result = await this.request({
      path: `${V1.BluefoxEndpoints.subscriberLists}/${subscriberListId}`,
      method: "POST",
      body: JSON.stringify({ name, email }),
    });

    if (result.ok) {
      return result.value;
    }

    return result.error;
  }

  /** https://bluefox.email/docs/api/subscriber-list-management#unsubscribe */
  async remove() {
    console.log(`Removing subscriber via ${this.context.baseUrl}`);
  }

  /** https://bluefox.email/docs/api/subscriber-list-management#pause */
  async pause() {
    console.log(`Pausing subscriber via ${this.context.baseUrl}`);
  }

  /** https://bluefox.email/docs/api/subscriber-list-management#activate */
  async activate() {
    console.log(`Activating subscriber via ${this.context.baseUrl}`);
  }
}

const bluefox = new BluefoxClient({ apiKey: "" });

bluefox.subscriber.add("12345", "jamal", "jamal@me.com");
