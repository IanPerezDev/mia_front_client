import { URL, HEADERS_API } from "../constants/apiConstant";

export const useSolicitud = () => {
  const crearSolicitud = async (solicitud: any) =>
    await postSolicitud(solicitud);

  const obtenerSolicitudes = async (callback: (json: PostBodyParams) => any) =>
    getSolicitud(callback);
  return {
    crearSolicitud,
    obtenerSolicitudes,
  };
};

async function getSolicitud(callback: (json: PostBodyParams) => void) {
  try {
    const res = await fetch(`${URL}/v1/mia/solicitud`, {
      method: "GET",
      headers: HEADERS_API,
    });
    const json = await res.json();
    const data = json.map((reservaDB) => {
      return {
        id: Math.round(Math.random() * 12345678),
        confirmation_code: reservaDB.confirmation_code,
        hotel_name: reservaDB.hotel,
        check_in: reservaDB.check_in,
        check_out: reservaDB.check_out,
        room_type: reservaDB.room,
        total_price: reservaDB.total,
        status: reservaDB.status,
        created_at: new Date().toLocaleDateString(),
        image_url: "",
      };
    });
    callback(data);
  } catch (error) {
    console.log(error);
  }
}
async function postSolicitud(solicitud:any, id_viajero:string) {
  if (solicitud.user_id) {
    solicitud.id_viajero = solicitud.user_id.slice(0, 4);
  }
  if (solicitud.confirmationCode) {
    solicitud.confirmation_code = solicitud.confirmationCode;
    solicitud.id_viajero = Math.round(Math.random() * 999999999);
    solicitud.hotel_name = solicitud.hotel.name;
    solicitud.check_in = solicitud.dates.checkIn;
    solicitud.check_out = solicitud.dates.checkOut;
    solicitud.room_type = solicitud.room.type;
    solicitud.total_price = solicitud.room.totalPrice;
    solicitud.status = "pending";
  }
  if (solicitud.checkIn) {
    solicitud.confirmation_code = Math.round(Math.random() * 999999999);
    solicitud.id_viajero = Math.round(Math.random() * 999999999);
    solicitud.hotel_name = "No hay nombre";
    solicitud.check_in = solicitud.checkIn;
    solicitud.check_out = solicitud.checkOut;
    solicitud.room_type = solicitud.roomType;
    solicitud.total_price = solicitud.totalPrice;
    solicitud.status = "pending";
  }
  try {
    const res = await fetch(`${URL}/v1/mia/solicitud`, {
      method: "POST",
      headers: HEADERS_API,
      body: JSON.stringify(solicitud),
    });
    const json = await res.json();
    console.log(json);
  } catch (error) {
    console.log(error);
  }
}

type PostBodyParams = {
  confirmation_code: string;
  id_viajero: number;
  hotel_name: string;
  check_in: string;
  check_out: string;
  room_type: string;
  total_price: number;
  status: string;
};
