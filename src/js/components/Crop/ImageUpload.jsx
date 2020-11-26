import React, { useState } from 'react'
import ImageCropper from './ImageCropper'
import Modal from "../Modal";
import playerAPI from '../../services/playerAPI';

const ImageUpload = ({ parentCallBack }) => {
    const [blob, setBlob] = useState(null)
    const [inputImg, setInputImg] = useState('')

    const getBlob = (blob) => {
        // pass blob up from the ImageCropper component
        setBlob(blob)
    }

    const onInputChange = (e) => {
        // convert image file to base64 string
        const file = e.target.files[0]
        const reader = new FileReader()

        reader.addEventListener('load', () => {
            setInputImg(reader.result)
        }, false)

        if (file) {
            reader.readAsDataURL(file)
        }
        showModal()
    }



    const handleSubmitImage = (e) => {
        // upload blob to firebase 'images' folder with filename 'image'
        e.preventDefault()
        var bodyFormData = new FormData();
        bodyFormData.append('image', blob)

        playerAPI.uploadNewPicture(bodyFormData)
            .then(response => {
                parentCallBack()
                hideModal()
            })
            .catch(error => {
                //handle error
                console.log(error);
            });

    }

    const [show, setShow] = useState(false)
    const showModal = () => {
        setShow(true)
    }
    const hideModal = () => {
        setShow(false)
        document.getElementById('formPicture').reset()
    }

    return (
        <form onSubmit={handleSubmitImage} id="formPicture">
            {
                inputImg && (
                    <Modal
                        show={show}
                        handleClose={hideModal}
                        title="Crop Img"
                    >
                        <div className="ModalCrop">
                            <ImageCropper
                                getBlob={getBlob}
                                inputImg={inputImg}
                            />
                            <button type='submit' className="btn btn-secondary">Submit</button>
                        </div>
                    </Modal>
                )
            }
            <label htmlFor="inputUploadImg" className="inputUploadImg">
                Changer votre photo de profil
            </label>
            <input
                type='file'
                accept='image/png, image/jpeg'
                onChange={onInputChange}
                id="inputUploadImg"
                hidden
            />

        </form>
    )
}

export default ImageUpload