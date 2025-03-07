import { V1 } from "@bluefox-email/api/v1";

/**
 * A client for the Bluefox.email API.
 *
 * @example
 * const bluefox = new BluefoxClient({ apiKey: "your-api-key" });
 * bluefox.subscriber.add("123-some-id", "Jamal", "jamal@me.com");
 */
export class BluefoxClient extends V1.BluefoxModule {
  /**
   * A module for managing subscribers.
   *
   * @see https://bluefox.email/docs/api/subscriber-list-management
   */
  public readonly subscriber: BluefoxSubscriber;

  /**
   * Creates a new BluefoxClient instance.
   *
   * @param config - The configuration for the client.
   */
  constructor(config: V1.BluefoxClientConfig) {
    const context: V1.BluefoxContext = {
      config,
      baseUrl: "https://api.bluefox.email/v1",
    };

    super(context);

    this.subscriber = new BluefoxSubscriber(context);
  }
}

/**
 * A module for managing subscribers.
 */
class BluefoxSubscriber extends V1.BluefoxModule {
  /**
   * Creates a new BluefoxSubscriber instance.
   *
   * @param context - The context for the module.
   */
  constructor(context: V1.BluefoxContext) {
    super(context);
  }

  /**
   * Subscribes a new member to the specified subscriber list.
   *
   * @param subscriberListId - The ID of the subscriber list to which the member should be added.
   * @param name - The name of the member to be added.
   * @param email - The email address of the member to be added.
   *
   * @throws {BluefoxError} If any of the required fields are missing.
   *
   * @see https://bluefox.email/docs/api/subscriber-list-management#subscribe
   */
  public async add(subscriberListId: string, name: string, email: string) {
    if (!subscriberListId || !name || !email) {
      this.missingFieldsError(["subscriberListId", "name", "email"]);
    }

    return await this.request({
      path: `${V1.BluefoxEndpoints.subscriberLists}/${subscriberListId}`,
      method: "POST",
      body: JSON.stringify({ name, email }),
    });
  }

  /**
   * Unsubscribes a member from the specified subscriber list.
   *
   * @param subscriberListId - The ID of the subscriber list from which the member should be removed.
   * @param email - The email address of the member to be removed.
   *
   * @throws {BluefoxError} If the email field is missing.
   *
   * @see https://bluefox.email/docs/api/subscriber-list-management#unsubscribe
   */
  public async remove(subscriberListId: string, email: string) {
    if (!email) this.missingFieldsError(["email"]);

    return await this.request({
      path: `${V1.BluefoxEndpoints.subscriberLists}/${subscriberListId}/${email}`,
      method: "PATCH",
      body: JSON.stringify({ status: "unsubscribed" }),
    });
  }

  /**
   * Pauses a member from the specified subscriber list until the specified date.
   *
   * @param subscriberListId - The ID of the subscriber list from which the member should be paused.
   * @param email - The email address of the member to be paused.
   * @param date - The date until which the member should be paused.
   *
   * @throws {BluefoxError} If any of the required fields are missing.
   *
   * @see https://bluefox.email/docs/api/subscriber-list-management#pause
   */
  public async pause(subscriberListId: string, email: string, date: Date) {
    if (!subscriberListId || !email) {
      this.missingFieldsError(["subscriberListId", "email"]);
    }

    return await this.request({
      path: `${V1.BluefoxEndpoints.subscriberLists}/${subscriberListId}/${email}`,
      method: "PATCH",
      body: JSON.stringify({
        status: "paused",
        pausedUntil: date.toISOString(),
      }),
    });
  }

  /**
   * Activates a member in the specified subscriber list.
   *
   * @param subscriberListId - The ID of the subscriber list in which the member should be activated.
   * @param email - The email address of the member to be activated.
   *
   * @throws {BluefoxError} If any of the required fields are missing.
   *
   * @see https://bluefox.email/docs/api/subscriber-list-management#activate
   */
  public async activate(subscriberListId: string, email: string) {
    if (!subscriberListId || !email) {
      this.missingFieldsError(["subscriberListId", "email"]);
    }

    return await this.request({
      path: `${V1.BluefoxEndpoints.subscriberLists}/${subscriberListId}/${email}`,
      method: "PATCH",
      body: JSON.stringify({ status: "active" }),
    });
  }

  private missingFieldsError(args: string[]) {
    throw new V1.BluefoxError(
      `Missing required fields: ${args.join(", ")}`,
      V1.BluefoxErrorCodes.BAD_REQUEST
    );
  }
}
