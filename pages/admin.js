import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Header, Footer, Loader, ICOSale } from "../Components"
import Admin from '../Components/Admin/Admin'
import AdminHead from '../Components/Admin/AdminHead'
import UpdateAPYModel from '../Components/Admin/UpdateAPYModel'
import Auth from "../Components/Admin/Auth"

import { CONTRACT_DATA, transferToken, createPool, swap, modifyPool } from "../Context";

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS

const admin = () => {
  const { address } = useAccount()
  const [loader, setLoader] = useState(false)
  const [checkAdmin, setCheckAdmin] = useState(false)
  const [poolDetails, setPoolDetails] = useState()
  const [modifyPoolID, setModifyPoolID] = useState()

  const loadData = async() => {
    if(address) {
      setLoader(true)

      if(address?.toLowerCase() == ADMIN_ADDRESS?.toLowerCase()) {
        setCheckAdmin(true);
        const data = await CONTRACT_DATA(address)
        setPoolDetails(data)
      }
      
      setLoader(false)
    }
  }

  useEffect(() => {
   loadData()
  }, [address])

  return (
    <div className="body-backgroundColor">
      <Header page={"admin"}/>
      <AdminHead />
      <Admin 
        poolDetails={poolDetails} 
        transferToken={transferToken}
        address={address}
        setLoader={setLoader}
        createPool={createPool}
        swap={swap}
        setModifyPoolID={setModifyPoolID}
      />

      <UpdateAPYModel 
        poolDetails={poolDetails}
        setLoader={setLoader}
        modifyPool={modifyPool}
        modifyPoolID={modifyPoolID}
      />

      <ICOSale setLoader={setLoader}/>
      <Footer />
      {!checkAdmin && <Auth />}
      {loader && <Loader />}
    </div>
  );
};

export default admin;
