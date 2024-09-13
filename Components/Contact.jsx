import React from "react";
import { useForm, ValidationError } from "@formspree/react";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";

const FORMSPREE_API = process.env.NEXT_PUBLIC_FORMSPREE_API

const Contact = ({ setContactUs }) => {
  const notifySuccess = (msg) => toast.success(msg, { duration: 2000 })

  const [state, handleSubmit] = useForm(FORMSPREE_API)

  if(state.succeeded) {
    return notifySuccess("Message sent successfully")
  }

  return <div className="modal modal--auto show" id="modal-ask" aria-labelledby="modal-ask" role="dialog" tabIndex={-1}
          style={{display: "block", paddingLeft: 0}}
  >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal__content">
            <button className="modal__close" onClick={() => setContactUs(false)}>
              <i className="ti ti-x">
                <IoMdClose/>
              </i>
            </button>

            <h4 className="modal__title">Ask a question</h4>
            <p className="modal__text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur, eaque. Molestiae officia sed sit repudiandae.</p>

            <form onSubmit={handleSubmit}>
              <div className="modal__form">
                <div className="form__group">
                  <input type="text" name="name" id="name" className="form__input" placeholder="Name" />
                  <ValidationError prefix="Name" field="name" errors={state.errors} />
                </div>
                <div className="form__group">
                  <input type="email" name="email" id="email" className="form__input" placeholder="Email" />
                  <ValidationError prefix="Email" field="email" errors={state.errors} />
                </div>
                <div className="form__group">
                  <textarea type="message" name="message" id="message" className="form__textarea" placeholder="Your Question" />
                </div>
                <button className="form__btn" type="submit" disabled={state.submitting}>Send</button>
              </div>
            </form>
          </div>
        </div>
      </div>
  </div>
};

export default Contact;
