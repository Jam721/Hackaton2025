import React, { useState } from 'react';
import styles from './AddObservationForm.module.css';

const AddObservationForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        observationTime: '',
        rightAscension: '',
        declination: '',
        cometId: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const success = await onSubmit(formData);

        if (success) {
            setFormData({
                observationTime: '',
                rightAscension: '',
                declination: '',
                cometId: ''
            });
        }

        setSubmitting(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className={styles.formContainer}>
            <h3> Добавить новое исследование</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Время наблюдения:</label>
                    <input
                        type="datetime-local"
                        name="observationTime"
                        value={formData.observationTime}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Прямое восхождение (RA):</label>
                    <input
                        type="number"
                        step="0.0001"
                        name="rightAscension"
                        value={formData.rightAscension}
                        onChange={handleChange}
                        placeholder="15.5234"
                        required
                        disabled={submitting}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Склонение (Dec):</label>
                    <input
                        type="number"
                        step="0.0001"
                        name="declination"
                        value={formData.declination}
                        onChange={handleChange}
                        placeholder="23.4567"
                        required
                        disabled={submitting}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>ID кометы:</label>
                    <input
                        type="number"
                        name="cometId"
                        value={formData.cometId}
                        onChange={handleChange}
                        placeholder="1"
                        required
                        disabled={submitting}
                    />
                </div>

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={submitting}
                >
                    {submitting ? ' Добавление...' : ' Добавить исследование'}
                </button>
            </form>
        </div>
    );
};

export default AddObservationForm;