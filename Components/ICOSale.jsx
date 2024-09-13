import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {IoMdClose} from "./ReactICON"
import { LOAD_TOKEN_ICO } from "../Context/constants";
import { BUY_TOKEN } from "../Context";

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY;

const ICOSale = ({setLoader}) => {
  const {address} = useAccount();
  const [tokenDetails, setTokenDetails] = useState()
  const [quantity, setQuantity] = useState(0)

  const CALLING_FUNCTION_BUY_TOKEN = async (quantity) => {
    setLoader(true);
    console.log(quantity)

    const receipt = await BUY_TOKEN(quantity);
    if(receipt){
      console.log(receipt);
      setLoader(false);
      window.location.reload();
    }
    setLoader(false)
  };


  useEffect(()=> {
    const loadToken = async() => {
      const token = await LOAD_TOKEN_ICO();
      setTokenDetails(token)
    }
    loadToken();
  }, [address])

  return <div className="modal modal--auto fade" id="modal-deposit1" aria-labelledby="modal-deposit1" tabIndex={-1} aria-hidden="true">
    <div className="modal-dialog modal-dialog-centerd">
      <div className="modal-content">
        <div className="modal__content">
          <button className="modal__close" type="button" data-bs-dismiss="modal" aria-label="close">
            <i className="ti ti-x">
              <IoMdClose/>
            </i>
          </button>

          <h4 className="modal__title">{tokenDetails?.token.symbol} ICO Token</h4>
          <p className="modal__text">Participate in the <span>ongoing ICO Token</span> sale</p>

          <div className="modal__form">
            <div className="form__group">
              <label className="form__label">ICO Supply:{" "}{`${tokenDetails?.tokenBal} ${tokenDetails?.token.symbol}`}</label>
              <input className="form__input" type="text" placeholder={`${tokenDetails?.token.symbol} ${tokenDetails?.token.balance.toString().slice(0,12)}`}
                onChange={(e)=>setQuantity(e.target.value)}
              />
            </div>

            <div className="form__group">
              <label className="form__label">Pay Amount</label>
              <input className="form__input" type="text" placeholder={`${Number(tokenDetails?.tokenPrice) * quantity} ${CURRENCY}`}
                disabled
              />
            </div>

            <button className="form__btn" type="button" onClick={() => CALLING_FUNCTION_BUY_TOKEN(quantity)}>
              Buy {tokenDetails?.token.symbol}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>;
};

export default ICOSale;
