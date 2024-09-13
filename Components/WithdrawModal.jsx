import React, {useState} from "react";

import {IoMdClose} from "./ReactICON"
import PopUpInputField from "./Admin/RegularComp/PopUpInputField"
import PopUpButton from "./Admin/RegularComp/PupUpButton"
import PupUpButton from "./Admin/RegularComp/PupUpButton";

const WithdrawModal = ({withdraw, withdrawPoolId, address, setLoader, claimReward}) => {

  const [amount, setAmount] = useState()

  const CALLING_FUNCTION = async (withdrawPoolId, amount, address) => {
    setLoader(true);

    const receipt = await withdraw(withdrawPoolId, amount, address);
    if(receipt){
      setLoader(false);
      window.location.reload();
    }
    setLoader(false)
  };

  const CALLING_CLAIM = async (withdrawPoolId) => {
    setLoader(true);

    const receipt = await claimReward(withdrawPoolId);
    if(receipt){
      setLoader(false);
      window.location.reload();
    }
    setLoader(false)
  };


  return <div className="modal modal--auto fade" id="modal-node" aria-labelledby="modal-apool" aria-hidden="true" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal__content">
            <button className="modal__close" type="button" data-bs-dismiss="modal" aria-label="close">
              <i className="ti ti-x">
                <IoMdClose/>
              </i>
            </button>

            <h4 className="modal__title">Withdraw Token</h4>
            <p className="modal__text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur, eaque. Molestiae officia sed sit repudiandae.</p>
            <div className="modal__form">
              <PopUpInputField 
                title={`Amount`}
                placeholder={"Amount"}
                handleChange={(e) => setAmount(e.target.value)}
              />
              <PupUpButton title={"Withdraw"} handleClick={() => CALLING_FUNCTION(withdrawPoolId, amount, address)}/>
              <PupUpButton title={"Claim Reward"} handleClick={() => CALLING_CLAIM(withdrawPoolId, amount, address)}/>

            </div>
          </div>
        </div>
      </div>
  </div>

};

export default WithdrawModal;
