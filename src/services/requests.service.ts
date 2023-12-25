const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
import axios from 'axios';

export const extract = async(userId:any, token:string) => {
    try {
        const response:any = await axios.get(
          `${baseurl}/api/requests/extract/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

          return response
        } catch (error:any) {
            console.error(error)
        }
}

export const extractWithFilter = async(userId:any, token:string, filters:string) => {
  try {
      const response:any = await axios.post(
        `${baseurl}/api/requests/extract/${userId}`, filters,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

        return response
      } catch (error:any) {
          console.error(error)
      }
}

export const withdrawal = async(userId:any, token:string, filters:any) => {
  try {
      const response:any = await axios.post(
        `${baseurl}/api/requests/withdrawal/${userId}`, filters,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

        return response
      } catch (error:any) {
          console.error(error)
      }
}

export const deposit = async(userId:any, token:string, filters:any) => {
  try {
      const response:any = await axios.post(
        `${baseurl}/api/requests/deposit/${userId}`, filters,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

        return response
      } catch (error:any) {
          console.error(error)
      }
}

export const subscription = async(userId:any, token:string, filters:any) => {
  try {
      const response:any = await axios.post(
        `${baseurl}/api/requests/subscription/${userId}`, filters,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

        return response
      } catch (error:any) {
          console.error(error)
      }
}

export const support = async(userId:any, token:string, filters:any) => {
  try {
      const response:any = await axios.post(
        `${baseurl}/api/requests/support/${userId}`, filters,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

        return response
      } catch (error:any) {
          console.error(error)
      }
}

export const respondWithdrawalRequest = async(res:any, token:string) => {
  try {
      const response:any = await axios.post(
        `${baseurl}/api/requests/res-withdrawal/`, 
        {res},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

        return response
      } catch (error:any) {
          console.error(error)
      }
}