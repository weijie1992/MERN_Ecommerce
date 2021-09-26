import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Image } from "antd";
import { Link } from "react-router-dom";

const CartModal = () => {
  const { cartModal, showModalProduct } = useSelector((state) => {
    return state;
  });
  const dispatch = useDispatch();
  const displayModalProduct = () => {
    return (
      <div>
        <div className="row">
          <div className="col-md-12">
            <div className="row">
              <div className="col-5">
                <Image
                  src={`${process.env.REACT_APP_AWSS3DIR}/${showModalProduct.images[0]}`}
                  preview={false}
                  width={100}
                />
              </div>
              <div className="col">
                <div className="font-weight-bold">{showModalProduct.name}</div>
                <div>{showModalProduct.description}</div>
                <div className="font-italic">
                  Quantity : {showModalProduct.quantity}
                </div>
                <div className="font-weight-bold">
                  Price : SGD${showModalProduct.price.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const handleModalChange = (e) => {
    dispatch({
      type: "TOGGLE_CARTMODAL",
      payload: !cartModal,
    });
  };
  return (
    <div>
      <Modal
        visible={cartModal}
        className="w-25"
        footer={null}
        style={{ top: "68px", right: "-330px" }}
        onCancel={handleModalChange}
        mask={false}
        // onOk={handleOk}
        // confirmLoading={confirmLoading}
      >
        <div>
          {Object.keys(showModalProduct).length > 0 && displayModalProduct()}
          <hr />
          <div className="row">
            <div className="col">
              <button
                type="button"
                onClick={handleModalChange}
                className="btn btn-light btn-sm btn-block"
                style={{ height: "40px" }}
              >
                Continue Shopping
              </button>
            </div>
            <div className="col">
              <Link to="/cart">
                <button
                  type="button"
                  onClick={handleModalChange}
                  className="btn btn-warning btn-sm btn-block"
                  style={{ height: "40px" }}
                >
                  Checkout
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Modal>
      <h1>{cartModal}</h1>
    </div>
  );
};

export default CartModal;
