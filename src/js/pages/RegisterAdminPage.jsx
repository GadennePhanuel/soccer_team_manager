import React, { useState } from "react";
import { Link } from "react-router-dom";
import Field from "../components/forms/Field";
import UserAPI from "../services/usersAPI";

const RegisterAdminPage = ({ history }) => {
  const [users, setUsers] = useState({
    roles: ["ROLE_ADMIN"],
    email: "",
    lastName: "",
    firstName: "",
    birthday: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    lastName: "",
    firstName: "",
    birthday: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  });

  //gestion des changements des inputs dans le formulaire
  const handleChange = (event) => {
    const { name, value } = event.currentTarget;
    setUsers({ ...users, [name]: value });
  };

  /**
   * Call ajax lors de la soumission du formulaire pour créer l'admin et l'utilisateur associé
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    const apiErrors = {};
    if (users.password !== users.passwordConfirm) {
      apiErrors.passwordConfirm =
        "Votre confimation de mot de passe n'est pas conforme";
      setErrors(apiErrors);
      return;
    }

    //création User
    try {
      const response = await UserAPI.registerUser(users);
      console.log(response)
      //création Admin
      try {
        await UserAPI.registerAdmin(response);

        //TODO : faire un petit FLASH de success

        //on efface les messages d'erreur et on renvoi sur la page de login
        setErrors("");
        history.replace("/login");
      } catch (error) {
        alert(
          "Erreur interne, compte utilisateur créé mais non assigné en tant que ROLE_ADMIN. contactez administrateur du site"
        );
      }
    } catch (error) {
      const { violations } = error.response.data;

      if (violations) {
        violations.forEach((violation) => {
          apiErrors[violation.propertyPath] = violation.message;
        });
        setErrors(apiErrors);
      }
    }
  };

  return (
    <>
      <h1>Inscription</h1>
      <form onSubmit={handleSubmit}>
        <Field
          name="email"
          label="Adresse email"
          placeholder="Votre email..."
          onChange={handleChange}
          type="email"
          value={users.email}
          error={errors.email}
        ></Field>
        <Field
          name="firstName"
          label="Prénom"
          placeholder="Votre prénom..."
          onChange={handleChange}
          value={users.firstName}
          error={errors.firstName}
        ></Field>
        <Field
          name="lastName"
          label="Nom"
          placeholder="Votre nom..."
          onChange={handleChange}
          value={users.lastName}
          error={errors.lastName}
        ></Field>
        <Field
          name="phone"
          label="Téléphone"
          placeholder="Votre numéro de téléphone..."
          onChange={handleChange}
          value={users.phone}
          error={errors.phone}
        ></Field>
        <Field
          name="birthday"
          label="Date de naissance"
          type="date"
          onChange={handleChange}
          value={users.birthday}
          error={errors.birthday}
        ></Field>
        <Field
          name="password"
          label="Mot de passe"
          type="password"
          placeholder="Votre mot de passe..."
          onChange={handleChange}
          value={users.password}
          error={errors.password}
        ></Field>
        <Field
          name="passwordConfirm"
          label="Confirmation de mot de passe"
          type="password"
          placeholder="Confirmez votre mot de passe..."
          onChange={handleChange}
          value={users.passwordConfirm}
          error={errors.passwordConfirm}
        ></Field>

        <div className="form-group">
          <button type="submit" className="btn btn-success">
            Confirmation
          </button>
          <Link to="/login" className="btn btn-link">
            J'ai déjà un compte
          </Link>
        </div>
      </form>
    </>
  );
};

export default RegisterAdminPage;
