import { Redis } from "@upstash/redis";

export const db = new Redis({
  url: "https://us1-normal-hermit-38172.upstash.io",
  token:
    "AZUcASQgODc5NjdmNTEtMGFkNy00NTBhLWFiOGEtMjQxMDljMWQ1NmIyODNhYmQ0YTlkYjIzNDA4ZWI4ZTUyYmEzYzcyOGM2NGE=",
});
