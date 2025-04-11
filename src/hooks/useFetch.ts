import { supabase } from "../services/supabaseClient";
import { getCompaniesAgent, getCompaniesAgentViajeros, getEmpresasDatosFiscales, getPaymentMethods, getCreditAgent, getPagosAgente } from "./useDatabase";

export const fetchCompaniesAgent = async () => {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No hay usuario autenticado");

    const companiesData = await getCompaniesAgent(user.user.id);
    return companiesData.data || [];
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
};

export const fetchViajerosCompanies = async () => {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No hay usuario autenticado");

    const employeesData = await getCompaniesAgentViajeros(user.user.id);
    return employeesData.data || [];
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
};

export const fetchEmpresasDatosFiscales = async () => {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No hay usuario autenticado");

    const employeesData = await getEmpresasDatosFiscales(user.user.id);
    return employeesData.data || [];
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
};

export const fetchPaymentMethods = async () => {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No hay usuario autenticado");

    const paymentMehtods = await getPaymentMethods(user.user.id);
    return paymentMehtods || [];
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return [];
  }
};

export const fetchCreditAgent = async () => {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No hay usuario autenticado");

    const creditData = await getCreditAgent(user.user.id);
    return creditData || [];
  } catch (error) {
    console.error("Error fetching credit:", error);
    return [];
  }
};

export const fetchPagosAgent = async () => {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No hay usuario autenticado");
    console.log("fsfasfas")
    const paymentData = await getPagosAgente(user.user.id);
    
    console.log(paymentData);
    return paymentData || [];
  } catch (error) {
    console.error("Error fetching credit:", error);
    return [];
  }
};
