import { Profile } from "@/models/types";

export function validateName(nome: string): string {
    return nome.trim() === "" ? "Nome é obrigatório" : "";
}


export function validateLogin(login: string): string {
    return login.trim() === "" ? "Login é obrigatório" : "";
}


export function validateDocumentIdentifier(identifier: string, rule: string) {
    const cleanIdentifier = identifier.replace(/\D/g, ""); // Remove caracteres não numéricos

    if (rule !== Profile.STUDENT) {
        // COMPANY selecionado, validando CNPJ
        if (cleanIdentifier.length !== 14) return "CNPJ deve ter 14 dígitos";
        if (!isValidCNPJ(cleanIdentifier)) return "CNPJ inválido";
    } else {
        if (cleanIdentifier.length !== 11) return "CPF deve ter 11 dígitos";
        if (!isValidCPF(cleanIdentifier)) return "CPF inválido";
    }

    return ""; // Documento válido
}

function isValidCPF(cpf: string): boolean {
    if (/^(\d)\1{10}$/.test(cpf)) return false; // CPF com todos os dígitos iguais é inválido

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let firstDigit = (sum * 10) % 11;
    if (firstDigit === 10 || firstDigit === 11) firstDigit = 0;
    if (firstDigit !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let secondDigit = (sum * 10) % 11;
    if (secondDigit === 10 || secondDigit === 11) secondDigit = 0;

    return secondDigit === parseInt(cpf.charAt(10));
}

function isValidCNPJ(cnpj: string): boolean {
    if (/^(\d)\1{13}$/.test(cnpj)) return false; // CNPJ com todos os dígitos iguais é inválido

    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (firstDigit !== parseInt(digits.charAt(0))) return false;

    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    return secondDigit === parseInt(digits.charAt(1));
}



export function validatePassword(password: string): string {
    const errors = [];
    if (password.length < 8) errors.push("Pelo menos 8 caracteres");
    if (!/[A-Z]/.test(password)) errors.push("Pelo menos 1 letra maiúscula");
    if (!/[!@#$%^&*]/.test(password)) errors.push("Pelo menos 1 caractere especial");
    if (!/\d/.test(password)) errors.push("Pelo menos 1 número");
    return errors.join(", ");
}

export function validateEmail(email: string): string {

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
        return "Insira um e-mail válido";
    }

    return "";
}

export function validateLattes(link: string): string {

    if (!link) return "";

    const lattesRegex = /^https?:\/\/lattes\.cnpq\.br\/\d+$/;

    if (!lattesRegex.test(link)) {
        return "Link do Lattes inválido";
    }

    return "";
}

export function validateUrlBase(value: string) {
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(:\d+)?(\/.*)?$/i;
    return !urlPattern.test(value.trim()) ? "Insira uma URL válida." : "";
}