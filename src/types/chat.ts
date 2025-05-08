interface MessageContent {
  component_type: "message";
  content: string;
}

interface CardHotel {
  component_type: "hotel";
  id_hotel: string;
}

export interface UserMessage {
  component_type: "user";
  content: string;
}

export interface ErrorMessage {
  component_type: "error";
  content: string;
}

export type ChatContent =
  | MessageContent
  | CardHotel
  | UserMessage
  | ErrorMessage;

export type ChatContentResponse = (MessageContent | CardHotel)[];

export interface Reservation {
  check_in: string;
  check_out: string;
  id_hotel: string;
  id_viajero: string;
}

export interface ChatResponse {
  content: ChatContentResponse;
  reservasEnProceso: Reservation[];
}

export interface FetchChatResponse {
  ok: boolean;
  response: {
    thread_id: string;
    value: {
      content: (MessageContent | CardHotel)[];
      reservasEnProceso: Reservation[];
    };
  };
}

export interface FetchFormatResponse {
  thread?: string;
  response?: ChatContentResponse;
  reserva?: Reservation[] | undefined;
  error?: string;
}
