import React from 'react';

const Select = ({ name, label, value, error, onChange, children }) => {
    return (
        <div className="form-group">
            <label htmlFor={name} className="mr-1">{label}</label>
            <select
                onChange={onChange}
                name={name}
                id={name}
                value={value}
                className={"form-control" + (error && " is-invalid")}
            >
                {children}
            </select>
            <p className="invalid-feedback">{error}</p>
        </div>
    );
}

const MySelect = props => (
    <Select {...props}

            value={props.options.filter(option => option.label === 'Some label')}
            onChange={value => props.input.onChange(value)}
            onBlur={() => props.input.onBlur(props.input.value)}
            options={props.options}
            placeholder={props.placeholder}
    /> );

export default Select;