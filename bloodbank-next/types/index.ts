export interface Donor {
    D_id: number;
    D_name: string | null;
    D_age: number | null;
    D_sex: string | null;
    D_phno: string | null;
    D_bgrp: string | null;
    D_weight: number | null;
    D_email: string | null;
    D_address: string | null;
    HLevel: string | null;
    BS: string | null;
    BP: string | null;
    rdate: Date | null;
    last_donation: Date | null;
    eligibility: string | null;
    diseases: string | null;
    password: string | null;
}

export interface BloodStock {
    stockid: number;
    b_grp: string;
    B_qnty: number | null;
}
