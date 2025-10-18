import{q as Ke,u as Qe,b as He,o as Ge,r as g,l as w,c as Ye,d as E,j as e,B as i,C as D,m as L,n as R,a as W,F as Je,e as he,f as ue,g as pe,h as ye,I as V,p as r,k as P}from"./index-Dk6nXF67.js";import{D as Xe,m as Ze,r as et,W as tt,v as st,o as at,a as b,V as X,b as ge,w as fe,Y as je}from"./dashboard-layout-BUO8e75G.js";import{S as Z}from"./stats-card-DnI6mJO0.js";import{B as be}from"./badge-P46XOlcm.js";import{T as nt}from"./textarea-BAi4nzW_.js";import{D as ee,a as te,b as se,c as ae}from"./dialog-mWSLCdZX.js";import{S as it,a as lt,b as rt,c as ot,d as ve}from"./select-Gj2YppMn.js";import{T as dt,a as ct,b as we,c as Ne}from"./tabs-B2htHbJV.js";import{c as Ce,h as ke,R as mt,D as Te}from"./users-Dxbor6Q1.js";import{C as xt}from"./circle-alert-BbQxKC8I.js";import"./index-CC2mel_A.js";import"./index-D-DdYU4C.js";function kt(){const{user:d}=Ke(),{toast:u}=Qe(),A=He(),[,ne]=Ge(),[N,T]=g.useState([]),[Se,U]=g.useState(!1),[c,f]=g.useState(""),[q,ie]=g.useState(""),[h,M]=g.useState(null),[_,$e]=g.useState("inhouse"),[Pe,K]=g.useState(!1),[y,C]=g.useState([]),[Ae,Q]=g.useState(!1),[j,le]=g.useState(""),{data:m}=w({queryKey:["/api/hotels/current"],refetchInterval:3e3}),{data:qe=[]}=w({queryKey:["/api/hotels/current/menu-items"],refetchInterval:3e3}),{data:re=[]}=w({queryKey:["/api/hotels/current/taxes"],refetchInterval:3e3});w({queryKey:["/api/halls"],refetchInterval:3e3});const{data:z=[]}=w({queryKey:["/api/pools"],refetchInterval:3e3}),{data:F=[]}=w({queryKey:["/api/services"],refetchInterval:3e3}),{data:Me=[]}=w({queryKey:["/api/users",d==null?void 0:d.id,"tasks"],refetchInterval:3e3}),S=Ye({defaultValues:{amount:"",description:""}}),k=E({mutationFn:async t=>{await P("POST","/api/transactions",t)},onSuccess:()=>{A.invalidateQueries({queryKey:["/api/hotels/current/transactions"]}),u({title:"Payment processed successfully"})}}),H=E({mutationFn:async t=>{if(!(d!=null&&d.hotelId))throw new Error("User not associated with a hotel");const s=parseFloat(t.amount);if(isNaN(s)||s<=0)throw new Error("Please enter a valid amount");return await P("POST","/api/transactions",{hotelId:d.hotelId,txnType:"cash_deposit_request",amount:s.toFixed(2),purpose:`Cash Deposit Request: ${t.description}`,reference:`Cashier: ${d.username}`,paymentMethod:"cash",createdBy:d.id})},onSuccess:()=>{u({title:"Success!",description:"Cash deposit request sent to Finance department",variant:"default"}),A.invalidateQueries({queryKey:["/api/hotels/current/transactions"]}),A.invalidateQueries({queryKey:["/api/transactions"]}),K(!1),S.reset()},onError:t=>{u({title:"Error",description:(t==null?void 0:t.message)||"Failed to submit cash deposit request. Please check the amount and try again.",variant:"destructive"})}}),ze=E({mutationFn:async({taskId:t,status:s})=>{await P("PUT",`/api/tasks/${t}`,{status:s})},onSuccess:()=>{A.invalidateQueries({queryKey:["/api/users",d==null?void 0:d.id,"tasks"]}),u({title:"Task updated successfully"})}}),G=E({mutationFn:async t=>{if(!t||t.trim().length===0)throw new Error("Please enter a voucher code");return await P("POST","/api/vouchers/validate",{code:t.trim()})},onSuccess:t=>{if(t.valid&&t.voucher){M(t.voucher);const s=t.voucher.discountType==="percentage"?`${t.voucher.discountAmount}% off`:`${r(t.voucher.discountAmount)} off`;u({title:"✓ Voucher Applied!",description:`Code: ${t.voucher.code} - ${s}`,variant:"default"})}else{M(null);const s=t.message||"Voucher code not found or expired";u({title:"Invalid Voucher",description:`${s}. Please check the code and try again. Vouchers must be created by Manager first.`,variant:"destructive"})}},onError:t=>{M(null),u({title:"Validation Error",description:(t==null?void 0:t.message)||"Unable to validate voucher. Please ensure the voucher exists in the system.",variant:"destructive"})}}),$=[...Me].sort((t,s)=>{const a={low:0,medium:1,high:2};return a[t.priority]-a[s.priority]}),Fe=$.filter(t=>t.status==="pending"),Be=$.filter(t=>t.status==="performing"),Oe=$.filter(t=>t.status==="completed"),Ie=t=>{switch(t){case"high":return"bg-red-100 text-red-800 border-red-300";case"medium":return"bg-yellow-100 text-yellow-800 border-yellow-300";case"low":return"bg-green-100 text-green-800 border-green-300";default:return"bg-gray-100 text-gray-800"}},Ee=t=>{switch(t){case"high":return e.jsx(xt,{className:"h-3 w-3"});case"medium":return e.jsx(Ce,{className:"h-3 w-3"});case"low":return e.jsx(ke,{className:"h-3 w-3"});default:return null}},De=(t,s=0)=>{const a=re.filter(v=>v.isActive);let n=0;a.forEach(v=>{n+=parseFloat(v.percent)/100});const x=Math.round(t/(1+n)*100)/100,o=Math.max(0,Math.round((x-s)*100)/100),p={};let l=0;a.forEach(v=>{const _e=parseFloat(v.percent)/100,xe=Math.round(o*_e*100)/100;p[v.taxType]={rate:parseFloat(v.percent),amount:xe},l+=xe});const I=Math.round((o+l)*100)/100;return{basePrice:Math.round(x*100)/100,discountedBase:Math.round(o*100)/100,taxBreakdown:p,totalTax:Math.round(l*100)/100,grandTotal:I}},Le=t=>{const s=N.find(a=>a.id===t.id);T(s?a=>a.map(n=>n.id===t.id?{...n,quantity:n.quantity+1}:n):a=>[...a,{...t,quantity:1}])},B=(t,s)=>{const a=t.priceWalkin,n=y.find(x=>x.id===t.id);C(n?x=>x.map(o=>o.id===t.id?{...o,quantity:o.quantity+1}:o):x=>[...x,{...t,type:s,price:a,quantity:1}])},oe=t=>{T(s=>s.filter(a=>a.id!==t))},Y=t=>{C(s=>s.filter(a=>a.id!==t))},de=(t,s)=>{if(s<=0){oe(t);return}T(a=>a.map(n=>n.id===t?{...n,quantity:s}:n))},O=(t,s)=>{if(s<=0){Y(t);return}C(a=>a.map(n=>n.id===t?{...n,quantity:s}:n))},Re=()=>{const t=N.reduce((a,n)=>a+n.price*n.quantity,0),s=y.reduce((a,n)=>a+n.price*n.quantity,0);return t+s},ce=()=>{const t=y.reduce((s,a)=>s+a.price*a.quantity,0);return Math.round(t*100)/100},J=()=>{const t=Re();let s=0;if(h){const n=parseFloat(h.discountAmount);if(h.discountType==="percentage"){const x=re.filter(l=>l.isActive);let o=0;x.forEach(l=>{o+=parseFloat(l.percent)/100});const p=Math.round(t/(1+o)*100)/100;s=Math.round(p*n/100*100)/100}else s=Math.round(n*100)/100}return{...De(t,s),discount:s}},We=()=>{q.trim()&&G.mutate(q.trim())},Ve=async()=>{if(!c){u({title:"Error",description:"Please select a payment method",variant:"destructive"});return}const t=J();try{if(await k.mutateAsync({txnType:c==="cash"?"cash_in":c==="pos"?"pos_in":"fonepay_in",amount:t.grandTotal.toString(),paymentMethod:c,purpose:_==="inhouse"?"restaurant_sale":"walk_in_sale",reference:h?`Voucher: ${h.code}`:void 0}),h)try{await P("POST","/api/vouchers/redeem",{voucherId:h.id})}catch{u({title:"Warning",description:"Transaction successful but voucher redemption failed",variant:"destructive"})}Ue()}catch{u({title:"Error",description:"Failed to process payment",variant:"destructive"})}},Ue=()=>{const t=J(),s=(m==null?void 0:m.name)||"HOTEL",a=(m==null?void 0:m.address)||"",n=(m==null?void 0:m.phone)||"",x=new Date;let o=`
<div style="font-family: 'Courier New', monospace; width: 300px; padding: 10px;">
  <div style="text-align: center; font-weight: bold; font-size: 16px; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
    ${s}
  </div>
  
  <div style="text-align: center; font-size: 11px; margin-bottom: 10px;">
    ${a?`${a}<br/>`:""}
    ${n?`Tel: ${n}<br/>`:""}
  </div>
  
  <div style="text-align: center; font-size: 12px; margin-bottom: 15px;">
    Restaurant Bill<br/>
    ${_==="walkin"?"WALK-IN CUSTOMER":"IN-HOUSE GUEST"}
  </div>
  
  <div style="font-size: 11px; margin-bottom: 10px;">
    <div>Date: ${x.toLocaleDateString("en-US",{year:"numeric",month:"short",day:"2-digit"})}</div>
    <div>Time: ${x.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</div>
    <div>Bill No: ${x.getTime().toString().slice(-8)}</div>
    <div>Cashier: ${d==null?void 0:d.username}</div>
  </div>
  
  <div style="border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 10px 0; margin: 10px 0;">
    <table style="width: 100%; font-size: 11px;">
      <thead>
        <tr style="border-bottom: 1px solid #000;">
          <th style="text-align: left; padding-bottom: 5px;">Item</th>
          <th style="text-align: center; padding-bottom: 5px;">Qty</th>
          <th style="text-align: right; padding-bottom: 5px;">Amount</th>
        </tr>
      </thead>
      <tbody>
`;N.forEach(l=>{o+=`
        <tr>
          <td style="padding: 3px 0;">${l.name}</td>
          <td style="text-align: center;">${l.quantity}</td>
          <td style="text-align: right;">${r(l.price*l.quantity)}</td>
        </tr>`}),y.forEach(l=>{o+=`
        <tr>
          <td style="padding: 3px 0;">${l.name} (${l.type})</td>
          <td style="text-align: center;">${l.quantity}</td>
          <td style="text-align: right;">${r(l.price*l.quantity)}</td>
        </tr>`}),o+=`
      </tbody>
    </table>
  </div>
  
  <div style="font-size: 11px; margin-top: 10px;">
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>Subtotal (Excl. Tax):</span>
      <span>${r(t.basePrice)}</span>
    </div>
`,Object.entries(t.taxBreakdown).forEach(([l,I])=>{o+=`
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>${l} (${I.rate}%):</span>
      <span>${r(I.amount)}</span>
    </div>`}),t.discount>0&&(o+=`
    <div style="display: flex; justify-content: space-between; padding: 3px 0; color: green;">
      <span>Discount (${h==null?void 0:h.code}):</span>
      <span>- ${r(t.discount)}</span>
    </div>`),o+=`
    <div style="display: flex; justify-content: space-between; padding: 10px 0 5px 0; margin-top: 5px; border-top: 2px dashed #000; font-weight: bold; font-size: 14px;">
      <span>GRAND TOTAL:</span>
      <span>${r(t.grandTotal)}</span>
    </div>
    
    <div style="display: flex; justify-content: space-between; padding: 5px 0; font-weight: bold;">
      <span>Payment Method:</span>
      <span>${c.toUpperCase()}</span>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 2px dashed #000; font-size: 12px;">
    Thank You! Visit Again<br/>
    <div style="margin-top: 5px; font-size: 10px;">
      This is a computer generated bill
    </div>
  </div>
</div>
    `;const p=window.open("","_blank","width=400,height=600");p&&(p.document.write(`
        <html>
          <head>
            <title>Bill - ${s}</title>
            <style>
              @media print {
                body { margin: 0; }
              }
              body {
                margin: 0;
                padding: 20px;
                font-family: 'Courier New', monospace;
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${o}
          </body>
        </html>
      `),p.document.close()),U(!1),T([]),C([]),f(""),M(null),ie("")},me=(t,s)=>{ze.mutate({taskId:t.id,status:s})};return e.jsx(Xe,{title:"Cashier Dashboard",children:e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4",children:[e.jsx(Z,{title:"Pending Tasks",value:Fe.length,icon:e.jsx(Ce,{}),iconColor:"text-orange-500"}),e.jsx(Z,{title:"In Progress",value:Be.length,icon:e.jsx(Ze,{}),iconColor:"text-blue-500"}),e.jsx(Z,{title:"Completed",value:Oe.length,icon:e.jsx(ke,{}),iconColor:"text-green-500"}),e.jsxs(i,{className:"h-full min-h-[100px]",onClick:()=>U(!0),size:"lg",children:[e.jsx(mt,{className:"h-6 w-6 mr-2"}),"New Checkout"]})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[e.jsxs(D,{children:[e.jsx(L,{children:e.jsx(R,{children:"My Tasks (Priority Order)"})}),e.jsx(W,{children:e.jsx("div",{className:"space-y-3",children:$.length===0?e.jsx("p",{className:"text-center text-muted-foreground py-4",children:"No tasks assigned"}):$.map(t=>e.jsxs("div",{className:`flex items-center justify-between p-4 border-2 rounded-lg ${Ie(t.priority)}`,children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[Ee(t.priority),e.jsx("h4",{className:"font-semibold",children:t.title}),e.jsx(be,{variant:"outline",className:"text-xs",children:t.priority.toUpperCase()})]}),e.jsx("p",{className:"text-sm opacity-90",children:t.description}),e.jsx(be,{variant:"secondary",className:"text-xs mt-2",children:t.status})]}),e.jsxs("div",{className:"flex flex-col gap-2 ml-4",children:[t.status==="pending"&&e.jsx(i,{size:"sm",onClick:()=>me(t,"performing"),children:"Start"}),t.status==="performing"&&e.jsx(i,{size:"sm",variant:"outline",onClick:()=>me(t,"completed"),children:"Complete"})]})]},t.id))})})]}),e.jsxs(D,{children:[e.jsx(L,{children:e.jsx(R,{children:"Quick Actions"})}),e.jsx(W,{children:e.jsxs("div",{className:"space-y-3",children:[e.jsxs(i,{variant:"outline",className:"w-full justify-start h-16",onClick:()=>ne("/hall-bookings"),"data-testid":"button-hall-bookings",children:[e.jsx(et,{className:"h-5 w-5 mr-3"}),"View Hall Bookings"]}),e.jsxs(i,{variant:"outline",className:"w-full justify-start h-16",onClick:()=>Q(!0),children:[e.jsx(tt,{className:"h-5 w-5 mr-3"}),"Bill Amenities (Walk-In Rate)"]}),e.jsxs(i,{variant:"outline",className:"w-full justify-start h-16",onClick:()=>K(!0),children:[e.jsx(st,{className:"h-5 w-5 mr-3"}),"Request Cash Deposit to Finance"]}),e.jsxs(i,{variant:"outline",className:"w-full justify-start h-16",onClick:()=>ne("/cashier/maintenance"),"data-testid":"button-maintenance",children:[e.jsx(at,{className:"h-5 w-5 mr-3"}),"Report Maintenance Issue"]})]})})]})]}),e.jsx(ee,{open:Pe,onOpenChange:K,children:e.jsxs(te,{children:[e.jsx(se,{children:e.jsx(ae,{children:"Request Cash Deposit to Finance"})}),e.jsx(Je,{...S,children:e.jsxs("form",{onSubmit:S.handleSubmit(t=>H.mutate(t)),className:"space-y-4",children:[e.jsx(he,{control:S.control,name:"amount",render:({field:t})=>e.jsxs(ue,{children:[e.jsx(pe,{children:"Amount (NPR)"}),e.jsx(ye,{children:e.jsx(V,{...t,type:"number",step:"0.01",min:"0.01",placeholder:"Enter amount",required:!0})})]})}),e.jsx(he,{control:S.control,name:"description",render:({field:t})=>e.jsxs(ue,{children:[e.jsx(pe,{children:"Description"}),e.jsx(ye,{children:e.jsx(nt,{...t,placeholder:"Reason for deposit",required:!0})})]})}),e.jsx(i,{type:"submit",className:"w-full",disabled:H.isPending,children:H.isPending?"Submitting...":"Submit Request"})]})})]})}),e.jsx(ee,{open:Ae,onOpenChange:Q,children:e.jsxs(te,{className:"w-full max-w-[95vw] sm:max-w-3xl max-h-[95vh] overflow-y-auto p-3 sm:p-6",children:[e.jsx(se,{className:"pb-2",children:e.jsx(ae,{className:"text-lg sm:text-xl md:text-2xl",children:"Bill Amenities (Walk-In Rate)"})}),e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsxs("div",{className:"p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800",children:[e.jsx("strong",{children:"Note:"})," All amenities are billed at walk-in customer rates. No stock limits apply. Halls cannot be billed here."]}),e.jsx("div",{className:"space-y-2",children:e.jsx(V,{placeholder:"Search amenities...",value:j,onChange:t=>le(t.target.value),className:"w-full","data-testid":"input-amenity-search"})}),e.jsx("div",{className:"space-y-3 max-h-[250px] overflow-y-auto",children:z.length>0||F.length>0?e.jsxs("div",{className:"space-y-2",children:[e.jsx("h4",{className:"font-medium text-sm",children:"Available Amenities"}),z.filter(t=>t.name.toLowerCase().includes(j.toLowerCase())).map(t=>e.jsxs("div",{className:"flex items-center justify-between p-3 border rounded-lg touch-manipulation",children:[e.jsxs("div",{className:"flex-1 min-w-0 pr-2",children:[e.jsxs("p",{className:"font-medium text-sm truncate",children:[t.name," (Pool)"]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:["Walk-in Rate: ",r(t.priceWalkin)]})]}),e.jsx(i,{size:"lg",className:"h-10 w-10 sm:h-12 sm:w-12 shrink-0",onClick:()=>B(t,"Pool"),"data-testid":`button-add-amenity-${t.id}`,children:e.jsx(b,{className:"h-5 w-5"})})]},t.id)),F.filter(t=>t.name.toLowerCase().includes(j.toLowerCase())||t.kind.toLowerCase().includes(j.toLowerCase())).map(t=>e.jsxs("div",{className:"flex items-center justify-between p-3 border rounded-lg touch-manipulation",children:[e.jsxs("div",{className:"flex-1 min-w-0 pr-2",children:[e.jsxs("p",{className:"font-medium text-sm truncate",children:[t.name," (",t.kind,")"]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:["Walk-in Rate: ",r(t.priceWalkin)]})]}),e.jsx(i,{size:"lg",className:"h-10 w-10 sm:h-12 sm:w-12 shrink-0",onClick:()=>B(t,t.kind),"data-testid":`button-add-amenity-${t.id}`,children:e.jsx(b,{className:"h-5 w-5"})})]},t.id))]}):e.jsx("p",{className:"text-sm text-muted-foreground text-center py-8",children:"No amenities available. Pools and services can be added by management."})}),e.jsxs("div",{className:"border-t pt-3",children:[e.jsx("h4",{className:"font-medium mb-2 text-sm sm:text-base",children:"Selected Items"}),y.length===0?e.jsx("p",{className:"text-sm text-muted-foreground py-4 text-center",children:"No items selected yet"}):e.jsx("div",{className:"space-y-2 max-h-[150px] overflow-y-auto",children:y.map(t=>e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-muted rounded",children:[e.jsxs("span",{className:"flex-1 font-medium text-sm min-w-0 truncate",children:[t.name," (",t.type,")"]}),e.jsxs("div",{className:"flex items-center gap-1 sm:gap-2 justify-between sm:justify-end",children:[e.jsx(i,{size:"sm",className:"h-8 w-8 sm:h-9 sm:w-9",variant:"outline",onClick:()=>O(t.id,t.quantity-1),"data-testid":`button-decrease-amenity-${t.id}`,children:e.jsx(X,{className:"h-3 w-3 sm:h-4 sm:w-4"})}),e.jsx("span",{className:"w-6 sm:w-8 text-center text-sm font-semibold",children:t.quantity}),e.jsx(i,{size:"sm",className:"h-8 w-8 sm:h-9 sm:w-9",variant:"outline",onClick:()=>O(t.id,t.quantity+1),"data-testid":`button-increase-amenity-${t.id}`,children:e.jsx(b,{className:"h-3 w-3 sm:h-4 sm:w-4"})}),e.jsx("span",{className:"w-16 sm:w-20 text-right text-sm font-semibold",children:r(t.price*t.quantity)}),e.jsx(i,{size:"sm",className:"h-8 w-8 sm:h-9 sm:w-9",variant:"destructive",onClick:()=>Y(t.id),"data-testid":`button-remove-amenity-${t.id}`,children:"×"})]})]},t.id))})]}),e.jsxs(D,{className:"w-full",children:[e.jsx(L,{className:"pb-3",children:e.jsx(R,{className:"text-base sm:text-lg",children:"Bill Summary (Tax-Free)"})}),e.jsx(W,{className:"space-y-2",children:(()=>{const t=ce();return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex justify-between text-xs sm:text-sm text-muted-foreground",children:[e.jsx("span",{children:"Subtotal:"}),e.jsx("span",{className:"font-semibold",children:r(t)})]}),e.jsxs("div",{className:"flex justify-between font-bold text-base sm:text-lg pt-2 border-t",children:[e.jsx("span",{children:"TOTAL:"}),e.jsx("span",{children:r(t)})]})]})})()})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("h4",{className:"font-medium text-sm sm:text-base",children:"Payment Method"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-2",children:[e.jsxs(i,{variant:c==="cash"?"default":"outline",className:"h-12 justify-start text-base",onClick:()=>f("cash"),children:[e.jsx(Te,{className:"h-5 w-5 mr-2"}),"Cash"]}),e.jsxs(i,{variant:c==="pos"?"default":"outline",className:"h-12 justify-start text-base",onClick:()=>f("pos"),children:[e.jsx(ge,{className:"h-5 w-5 mr-2"}),"POS/Card"]}),e.jsxs(i,{variant:c==="fonepay"?"default":"outline",className:"h-12 justify-start text-base",onClick:()=>f("fonepay"),children:[e.jsx(fe,{className:"h-5 w-5 mr-2"}),"Fonepay"]})]})]}),e.jsxs(i,{className:"w-full h-14 text-base sm:text-lg",size:"lg",onClick:async()=>{if(!c){u({title:"Error",description:"Please select a payment method",variant:"destructive"});return}const t=ce();try{await k.mutateAsync({txnType:c==="cash"?"cash_in":c==="pos"?"pos_in":"fonepay_in",amount:t.toString(),paymentMethod:c,purpose:"amenity_sale",reference:"Walk-in amenity billing (Tax-free)"});const s=(m==null?void 0:m.name)||"HOTEL",a=(m==null?void 0:m.address)||"",n=(m==null?void 0:m.phone)||"",x=new Date;let o=`
                    <div style="font-family: 'Courier New', monospace; width: 300px; padding: 10px;">
                      <div style="text-align: center; font-weight: bold; font-size: 16px; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
                        ${s}
                      </div>
                      
                      <div style="text-align: center; font-size: 11px; margin-bottom: 10px;">
                        ${a?`${a}<br/>`:""}
                        ${n?`Tel: ${n}<br/>`:""}
                      </div>
                      
                      <div style="text-align: center; font-size: 12px; margin-bottom: 15px;">
                        Amenity Bill (Tax-Free)<br/>
                        WALK-IN CUSTOMER
                      </div>
                      
                      <div style="font-size: 11px; margin-bottom: 10px;">
                        <div>Date: ${x.toLocaleDateString("en-US",{year:"numeric",month:"short",day:"2-digit"})}</div>
                        <div>Time: ${x.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</div>
                        <div>Bill No: ${x.getTime().toString().slice(-8)}</div>
                        <div>Cashier: ${d==null?void 0:d.username}</div>
                      </div>
                      
                      <div style="border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 10px 0; margin: 10px 0;">
                        <table style="width: 100%; font-size: 11px;">
                          <thead>
                            <tr style="border-bottom: 1px solid #000;">
                              <th style="text-align: left; padding-bottom: 5px;">Item</th>
                              <th style="text-align: center; padding-bottom: 5px;">Qty</th>
                              <th style="text-align: right; padding-bottom: 5px;">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                    `;y.forEach(l=>{o+=`
                            <tr>
                              <td style="padding: 3px 0;">${l.name} (${l.type})</td>
                              <td style="text-align: center;">${l.quantity}</td>
                              <td style="text-align: right;">${r(l.price*l.quantity)}</td>
                            </tr>`}),o+=`
                          </tbody>
                        </table>
                      </div>
                      
                      <div style="font-size: 11px; margin-top: 10px;">
                        <div style="display: flex; justify-content: space-between; padding: 3px 0;">
                          <span>Subtotal:</span>
                          <span>${r(t)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 10px 0 5px 0; margin-top: 5px; border-top: 2px dashed #000; font-weight: bold; font-size: 14px;">
                          <span>TOTAL:</span>
                          <span>${r(t)}</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; padding: 5px 0; font-weight: bold;">
                          <span>Payment Method:</span>
                          <span>${c.toUpperCase()}</span>
                        </div>
                      </div>
                      
                      <div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 2px dashed #000; font-size: 12px;">
                        Thank You! Visit Again<br/>
                        <div style="margin-top: 5px; font-size: 10px;">
                          This is a computer generated bill
                        </div>
                      </div>
                    </div>
                    `;const p=window.open("","_blank","width=400,height=600");p&&(p.document.write(`
                        <html>
                          <head>
                            <title>Amenity Bill - ${s}</title>
                            <style>
                              @media print {
                                body { margin: 0; }
                              }
                              body {
                                margin: 0;
                                padding: 20px;
                                font-family: 'Courier New', monospace;
                              }
                            </style>
                          </head>
                          <body onload="window.print(); window.close();">
                            ${o}
                          </body>
                        </html>
                      `),p.document.close()),Q(!1),C([]),f("")}catch{u({title:"Error",description:"Failed to process payment",variant:"destructive"})}},disabled:k.isPending||y.length===0||!c,children:[e.jsx(je,{className:"h-5 w-5 mr-2"}),k.isPending?"Processing...":"Checkout & Print Bill"]})]})]})}),e.jsx(ee,{open:Se,onOpenChange:U,children:e.jsxs(te,{className:"w-full max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl max-h-[95vh] overflow-y-auto p-3 sm:p-6",children:[e.jsx(se,{className:"pb-2",children:e.jsx(ae,{className:"text-lg sm:text-xl md:text-2xl",children:"Checkout & Billing"})}),e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx("div",{className:"w-full",children:e.jsxs(it,{value:_,onValueChange:t=>$e(t),children:[e.jsx(lt,{className:"w-full sm:w-64 h-12 text-base",children:e.jsx(rt,{})}),e.jsxs(ot,{children:[e.jsx(ve,{value:"inhouse",className:"text-base",children:"In-House Guest"}),e.jsx(ve,{value:"walkin",className:"text-base",children:"Walk-In Customer"})]})]})}),e.jsxs(dt,{defaultValue:"menu",className:"w-full",children:[e.jsxs(ct,{className:"grid w-full grid-cols-2 h-12",children:[e.jsx(we,{value:"menu",className:"text-sm sm:text-base",children:"Menu Items"}),e.jsx(we,{value:"amenities",className:"text-sm sm:text-base",children:"Amenities"})]}),e.jsx(Ne,{value:"menu",className:"space-y-2 max-h-[200px] sm:max-h-[300px] overflow-y-auto mt-3",children:qe.filter(t=>t.active).map(t=>e.jsxs("div",{className:"flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 touch-manipulation",children:[e.jsxs("div",{className:"flex-1 min-w-0 pr-2",children:[e.jsx("p",{className:"font-medium text-sm sm:text-base truncate",children:t.name}),e.jsx("p",{className:"text-xs sm:text-sm text-muted-foreground",children:r(t.price)})]}),e.jsx(i,{size:"lg",className:"h-10 w-10 sm:h-12 sm:w-12 shrink-0",onClick:()=>Le(t),children:e.jsx(b,{className:"h-5 w-5"})})]},t.id))}),e.jsxs(Ne,{value:"amenities",className:"space-y-3 max-h-[200px] sm:max-h-[300px] overflow-y-auto mt-3",children:[e.jsxs("div",{className:"mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800",children:[e.jsx("strong",{children:"Note:"})," Amenities are billed at walk-in customer rates. No stock limits apply."]}),e.jsx(V,{placeholder:"Search amenities...",value:j,onChange:t=>le(t.target.value),className:"w-full mb-2","data-testid":"input-checkout-amenity-search"}),z.length>0||F.length>0?e.jsxs("div",{className:"space-y-2",children:[e.jsx("h4",{className:"font-medium text-sm",children:"Available Amenities (Walk-In Rate)"}),z.filter(t=>t.name.toLowerCase().includes(j.toLowerCase())).map(t=>e.jsxs("div",{className:"flex items-center justify-between p-3 border rounded-lg touch-manipulation",children:[e.jsxs("div",{className:"flex-1 min-w-0 pr-2",children:[e.jsxs("p",{className:"font-medium text-sm truncate",children:[t.name," (Pool)"]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:["Walk-in Rate: ",r(t.priceWalkin)]})]}),e.jsx(i,{size:"lg",className:"h-10 w-10 sm:h-12 sm:w-12 shrink-0",onClick:()=>B(t,"Pool"),"data-testid":`button-checkout-add-amenity-${t.id}`,children:e.jsx(b,{className:"h-5 w-5"})})]},t.id)),F.filter(t=>t.name.toLowerCase().includes(j.toLowerCase())||t.kind.toLowerCase().includes(j.toLowerCase())).map(t=>e.jsxs("div",{className:"flex items-center justify-between p-3 border rounded-lg touch-manipulation",children:[e.jsxs("div",{className:"flex-1 min-w-0 pr-2",children:[e.jsxs("p",{className:"font-medium text-sm truncate",children:[t.name," (",t.kind,")"]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:["Walk-in Rate: ",r(t.priceWalkin)]})]}),e.jsx(i,{size:"lg",className:"h-10 w-10 sm:h-12 sm:w-12 shrink-0",onClick:()=>B(t,t.kind),"data-testid":`button-checkout-add-amenity-${t.id}`,children:e.jsx(b,{className:"h-5 w-5"})})]},t.id))]}):e.jsx("p",{className:"text-sm text-muted-foreground text-center py-8",children:"No amenities available. Pools and services can be added by management."})]})]}),e.jsxs("div",{className:"border-t pt-3",children:[e.jsx("h4",{className:"font-medium mb-2 text-sm sm:text-base",children:"Current Order"}),N.length===0&&y.length===0?e.jsx("p",{className:"text-sm text-muted-foreground py-4 text-center",children:"No items added yet"}):e.jsxs("div",{className:"space-y-2 max-h-[150px] overflow-y-auto",children:[N.map(t=>e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-muted rounded",children:[e.jsx("span",{className:"flex-1 font-medium text-sm min-w-0 truncate",children:t.name}),e.jsxs("div",{className:"flex items-center gap-1 sm:gap-2 justify-between sm:justify-end",children:[e.jsx(i,{size:"sm",className:"h-8 w-8 sm:h-9 sm:w-9",variant:"outline",onClick:()=>de(t.id,t.quantity-1),children:e.jsx(X,{className:"h-3 w-3 sm:h-4 sm:w-4"})}),e.jsx("span",{className:"w-6 sm:w-8 text-center text-sm font-semibold",children:t.quantity}),e.jsx(i,{size:"sm",className:"h-8 w-8 sm:h-9 sm:w-9",variant:"outline",onClick:()=>de(t.id,t.quantity+1),children:e.jsx(b,{className:"h-3 w-3 sm:h-4 sm:w-4"})}),e.jsx("span",{className:"w-16 sm:w-20 text-right text-sm font-semibold",children:r(t.price*t.quantity)}),e.jsx(i,{size:"sm",className:"h-8 w-8 sm:h-9 sm:w-9",variant:"destructive",onClick:()=>oe(t.id),children:"×"})]})]},t.id)),y.map(t=>e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-muted rounded",children:[e.jsxs("span",{className:"flex-1 font-medium text-sm min-w-0 truncate",children:[t.name," (",t.type,")"]}),e.jsxs("div",{className:"flex items-center gap-1 sm:gap-2 justify-between sm:justify-end",children:[e.jsx(i,{size:"sm",className:"h-8 w-8 sm:h-9 sm:w-9",variant:"outline",onClick:()=>O(t.id,t.quantity-1),"data-testid":`button-checkout-decrease-amenity-${t.id}`,children:e.jsx(X,{className:"h-3 w-3 sm:h-4 sm:w-4"})}),e.jsx("span",{className:"w-6 sm:w-8 text-center text-sm font-semibold",children:t.quantity}),e.jsx(i,{size:"sm",className:"h-8 w-8 sm:h-9 sm:w-9",variant:"outline",onClick:()=>O(t.id,t.quantity+1),"data-testid":`button-checkout-increase-amenity-${t.id}`,children:e.jsx(b,{className:"h-3 w-3 sm:h-4 sm:w-4"})}),e.jsx("span",{className:"w-16 sm:w-20 text-right text-sm font-semibold",children:r(t.price*t.quantity)}),e.jsx(i,{size:"sm",className:"h-8 w-8 sm:h-9 sm:w-9",variant:"destructive",onClick:()=>Y(t.id),"data-testid":`button-checkout-remove-amenity-${t.id}`,children:"×"})]})]},t.id))]})]}),e.jsxs(D,{className:"w-full",children:[e.jsx(L,{className:"pb-3",children:e.jsx(R,{className:"text-base sm:text-lg",children:"Bill Summary"})}),e.jsx(W,{className:"space-y-2",children:(()=>{const t=J();return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex justify-between text-xs sm:text-sm",children:[e.jsx("span",{children:"Subtotal (Excl. Tax):"}),e.jsx("span",{className:"font-semibold",children:r(t.basePrice)})]}),Object.entries(t.taxBreakdown).map(([s,a])=>e.jsxs("div",{className:"flex justify-between text-xs sm:text-sm",children:[e.jsxs("span",{children:[s," (",a.rate,"%):"]}),e.jsx("span",{className:"font-semibold",children:r(a.amount)})]},s)),t.discount>0&&e.jsxs("div",{className:"flex justify-between text-xs sm:text-sm text-green-600",children:[e.jsx("span",{children:"Discount:"}),e.jsxs("span",{className:"font-semibold",children:["- ",r(t.discount)]})]}),e.jsxs("div",{className:"flex justify-between font-bold text-base sm:text-lg pt-2 border-t",children:[e.jsx("span",{children:"GRAND TOTAL:"}),e.jsx("span",{children:r(t.grandTotal)})]})]})})()})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("h4",{className:"font-medium text-sm sm:text-base",children:"Voucher Code (Optional)"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(V,{placeholder:"Enter voucher code",value:q,onChange:t=>ie(t.target.value.toUpperCase()),className:"h-12 text-base"}),e.jsx(i,{onClick:We,disabled:G.isPending||!q.trim(),className:"h-12 px-6 shrink-0",children:G.isPending?"...":"Apply"})]}),h&&e.jsxs("p",{className:"text-xs sm:text-sm text-green-600",children:['✓ Voucher "',h.code,'" applied: -',r(h.discountAmount)]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("h4",{className:"font-medium text-sm sm:text-base",children:"Payment Method"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-2",children:[e.jsxs(i,{variant:c==="cash"?"default":"outline",className:"h-12 justify-start text-base",onClick:()=>f("cash"),children:[e.jsx(Te,{className:"h-5 w-5 mr-2"}),"Cash"]}),e.jsxs(i,{variant:c==="pos"?"default":"outline",className:"h-12 justify-start text-base",onClick:()=>f("pos"),children:[e.jsx(ge,{className:"h-5 w-5 mr-2"}),"POS/Card"]}),e.jsxs(i,{variant:c==="fonepay"?"default":"outline",className:"h-12 justify-start text-base",onClick:()=>f("fonepay"),children:[e.jsx(fe,{className:"h-5 w-5 mr-2"}),"Fonepay"]})]})]}),e.jsxs(i,{className:"w-full h-14 text-base sm:text-lg",size:"lg",onClick:Ve,disabled:k.isPending||N.length===0&&y.length===0||!c,children:[e.jsx(je,{className:"h-5 w-5 mr-2"}),k.isPending?"Processing...":"Checkout & Print Bill"]})]})]})})]})})}export{kt as default};
