import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Header, Footer, Loader, ICOSale, Statistics, Notification } from "../Components"
import { CONTRACT_DATA } from "../Context";

const activities = () => {

  const {address} = useAccount()

  const loadData = async() => {
    if(address) {
      setLoader(true)

        const data = await CONTRACT_DATA(address)
        setPoolDetails(data)
      
      setLoader(false)
    }
  }

  useEffect(() => {
   loadData()
  }, [address])
  const [loader, setLoader] = useState(false)
  const [poolDetails, setPoolDetails] = useState()

  return (
  <>
    <Header page={"activity"} />
    <div className="new-margin"></div>
      <Statistics poolDetails={poolDetails}/>
      <Notification page={"activities"} poolDetails={poolDetails} />

      <Footer />
      <ICOSale setLoader={setLoader} />
      {
        loader && <Loader />
      }
  </>
);
};

export default activities;
