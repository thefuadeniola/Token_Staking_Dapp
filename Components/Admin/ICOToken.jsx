import React, { useEffect, useState } from "react";
import ButtonCmp from "./RegularComp/ButtonCmp";
import InputField from "./RegularComp/InputField"
import ClickButton from "./RegularComp/ClickButton"
import Title from "./RegularComp/Title"
import { useAccount } from "wagmi";
import { LOAD_TOKEN_ICO, TOKEN_ICO_CONTRACT } from "../../Context/constants";
import { UPDATE_TOKEN, UPDATE_TOKEN_PRICE, TOKEN_WITHDRAW } from "../../Context";

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY;

const ICOToken = ({ setLoader }) => {
  const {address} = useAccount();
  const [tokenDetails, setTokenDetails] = useState()
  const [updateToken, setUpdateToken] = useState()
  const [updatePrice, setUpdatePrice] = useState()

  useEffect(()=> {
    const loadToken = async() => {
      const token = await LOAD_TOKEN_ICO();
      setTokenDetails(token)
      console.log(token)
    }
    loadToken();
  }, [address])

  const CALLING_FUNCTION_UPDATE_TOKEN = async (updateToken) => {
    setLoader(true);
    console.log(updateToken)

    const receipt = await UPDATE_TOKEN(updateToken);
    if(receipt){
      console.log(receipt);
      setLoader(false);
      window.location.reload();
    }
    setLoader(false)
  };

  const CALLING_FUNCTION_UPDATE_TOKEN_PRICE = async (updatePrice) => {
    setLoader(true);
    console.log(updatePrice)

    const receipt = await UPDATE_TOKEN_PRICE(updatePrice);
    if(receipt){
      console.log(receipt);
      setLoader(false);
      window.location.reload();
    }
    setLoader(false)
  };

  const CALLING_FUNCTION_TOKEN_WITHDRAW = async () => {
    setLoader(true);

    const receipt = await TOKEN_WITHDRAW();
    if(receipt){
      console.log(receipt);
      setLoader(false);
      window.location.reload();
    }
    setLoader(false)
  };



  return (
  <div className="tab-pane fade" id="tab-6" role="tabpanel">
    <div className="row">
      <div className="col-12">
        <div className="profile">
          <ul className="nav nav-tabs section__tabs section__tabs--left" id="section__profile-tabs2" role="tablist">
            <ButtonCmp name={"Update Token"} tab={"f9"} styleClass={"active"} />
            <ButtonCmp name={"Update Token Price"} tab={"f10"} />
            <ButtonCmp name={"Withdraw Token"} tab={"f11"} />

          </ul>

          <div className="tab-content">
            {/* 1 */}
            <div className="tab-pane fade show active" id="tab-f9" role="tabpanel">
              <div className="row">
                <Title title={"Update Token Address in ICO Contract"} />
              </div>

              <InputField size={"12"} type={"text"} title={"Address"} name={"crypto"} placeholder={`${tokenDetails?.token.symbol} ${tokenDetails?.token.name}`} handleChange={(e) => setUpdateToken(e.target.value)}/>

              <ClickButton name="Update Token" handleClick={() => CALLING_FUNCTION_UPDATE_TOKEN(updateToken)}/>
            </div>

            {/* 2 */}

            <div className="tab-pane fade" id="tab-f10" role="tabpanel">
              <div className="row">
                <Title title={"Update Token Price in ICO Contract"} />
              </div>

              <InputField size={"12"} type={"text"} title={"Price"} name={"price1"} placeholder={`${tokenDetails?.tokenPrice} ${CURRENCY}`} handleChange={(e) => setUpdatePrice(e.target.value)}/>

              <ClickButton name="Update Token" handleClick={() => CALLING_FUNCTION_UPDATE_TOKEN_PRICE(updatePrice)}/>
            </div>

            {/* 3 */}

            <div className="tab-pane fade" id="tab-f11" role="tabpanel">
              <div className="row">
                <Title title={"Withdraw token from ICO Contract"} />
              </div>

              <ClickButton name="Withdraw All Tokens" handleClick={() => CALLING_FUNCTION_TOKEN_WITHDRAW(updatePrice)}/>
            </div>


          </div>

        </div>
      </div>
    </div>
  </div>
  );
};

export default ICOToken;
