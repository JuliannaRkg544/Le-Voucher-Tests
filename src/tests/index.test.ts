import * as voucherService from "../services/voucherService"
import voucherRepository from "repositories/voucherRepository";
import { Voucher } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

describe("create voucher", ()=>{
  const code:string = generateCode();
  const discount:number = parseInt(generateNumber(1,100));
  const voucher:Voucher = {
    id:4,
    code,
    discount,
    used:true 
  }
    it("should return a conflict error", ()=>{
  jest
  .spyOn(voucherRepository, "getVoucherByCode")
  .mockImplementationOnce(():any=>{
    return voucher;
  })

 const promise = voucherService.default.createVoucher(voucher.code, voucher.discount);

 expect(promise).rejects.toEqual({
  message:"Voucher already exist.",
  type:"conflict"
 })

})
  it("should create a voucher", async ()=>{
    const result = voucherService.default.createVoucher(voucher.code, voucher.discount);
    jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce(() => {
      return undefined
    });
    jest.spyOn(voucherRepository, "createVoucher").mockImplementationOnce((): any => { });
    
    await voucherService.default.createVoucher(voucher.code, voucher.discount);
    expect(voucherRepository.createVoucher).toBeCalledTimes(1);
   
  })
  
})

describe("aplly voucher discount", ()=>{
  const code:string = generateCode();
  const discount:number = parseInt(generateNumber(1,100));
  let voucher:Voucher = {
    id:4,
    code,
    discount,
    used:true 
  }
  it("should say that the voucher is not valid", async ()=>{
    jest
    .spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce(():any =>{
      return undefined
    })
    const promise = voucherService.default.applyVoucher(voucher.code, voucher.discount)
    expect(promise).rejects.toEqual({
      type:"conflict",
      message:"Voucher does not exist."
     
    })
  })
  it("should not be able to apply the voucher discount", async ()=>{
    jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(voucher);

    const amount = generateNumber(200,500)
    const result = await voucherService.default.applyVoucher(voucher.code, amount);

    expect(result).toEqual({
      amount,
      discount: voucher.discount,
      finalAmount: amount,
      applied: false
    });
  });
  it("should aplly the voucher", async ()=>{
    voucher.used = false
    const amount = generateNumber(200 , 500);

    const finalAmount = amount - (amount * voucher.discount/100);
    
    jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(voucher);

    jest.spyOn(voucherRepository, "useVoucher").mockImplementationOnce((): any => { });

    const result = await voucherService.default.applyVoucher(voucher.code, amount);

    expect(result).toEqual({
      amount,
      discount: voucher.discount,
      finalAmount,
      applied: true
    });
  })
  
})

function generateCode(){
    const code:string = uuidv4()
    return code 
}

function generateNumber(min, max){
    return Math.random() * (max - min) + min;
}