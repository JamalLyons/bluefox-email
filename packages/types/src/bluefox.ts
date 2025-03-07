/** Version 1 of the Bluefox API */
export namespace V1 {
  /** https://bluefox.email/docs/api/ */
  export abstract class BaseBluefoxClient {
    protected config: Config;
    protected subscriber: BluefoxSubscriber;

    constructor(config: Config, subscriber: BluefoxSubscriber) {
      this.config = config;
      if (!this.config.BLUEFOX_API_KEY) {
        throw new Error("BLUEFOX_API_KEY is required");
      }

      this.subscriber = subscriber;
    }

    getSubscriber(): BluefoxSubscriber {
      return this.subscriber;
    }
  }

  /** API configuration */
  export interface Config {
    BLUEFOX_API_KEY: string;
  }

  /** https://bluefox.email/docs/api/subscriber-list-management */
  export abstract class BluefoxSubscriber {
    protected config: Config;

    constructor(config: Config) {
      this.config = config;
    }

    /** https://bluefox.email/docs/api/subscriber-list-management#subscribe */
    abstract add(): void;

    /** https://bluefox.email/docs/api/subscriber-list-management#unsubscribe */
    abstract remove(): void;

    /** https://bluefox.email/docs/api/subscriber-list-management#pause */
    abstract pause(): void;

    /** https://bluefox.email/docs/api/subscriber-list-management#activate */
    abstract activate(): void;
  }
}
