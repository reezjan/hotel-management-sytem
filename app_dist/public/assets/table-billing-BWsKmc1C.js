import{q as xe,u as he,b as ye,r as k,l as $,d as L,j as e,C as H,m as Y,n as G,a as J,p as n,I as A,B as E,s as W,k as M}from"./index-Dk6nXF67.js";import{D as fe,l as ge,v as R,w as V,b as de,Y as ve}from"./dashboard-layout-BUO8e75G.js";import{S as be,a as je,b as Ne,c as we,d as _}from"./select-Gj2YppMn.js";import{h as Te}from"./users-Dxbor6Q1.js";import"./circle-alert-BbQxKC8I.js";import"./index-CC2mel_A.js";import"./index-D-DdYU4C.js";function Oe(){const{user:B}=xe(),{toast:m}=he(),S=ye(),[j,X]=k.useState(""),[r,Z]=k.useState(""),[I,z]=k.useState(""),[c,C]=k.useState(null),[D,Q]=k.useState(""),[ee,te]=k.useState(""),[K,ae]=k.useState({}),{data:g}=$({queryKey:["/api/hotels/current"]}),{data:U=[]}=$({queryKey:["/api/hotels/current/restaurant-tables"],refetchInterval:5e3,refetchIntervalInBackground:!0}),{data:se=[]}=$({queryKey:["/api/hotels/current/kot-orders"],refetchInterval:3e3,refetchIntervalInBackground:!0}),{data:F=[]}=$({queryKey:["/api/hotels/current/menu-items"]}),{data:ie=[]}=$({queryKey:["/api/hotels/current/taxes"]}),q=L({mutationFn:async t=>{await M("POST","/api/transactions",t)},onSuccess:()=>{S.invalidateQueries({queryKey:["/api/hotels/current/transactions"]}),m({title:"Payment processed successfully"})}}),le=L({mutationFn:async({orderId:t,status:s})=>{await M("PUT",`/api/kot-orders/${t}`,{status:s})},onSuccess:()=>{S.invalidateQueries({queryKey:["/api/hotels/current/kot-orders"]})}}),[oe,ne]=k.useState(!1),ce=async()=>{if(!I.trim()){m({title:"Please enter a voucher code",variant:"destructive"});return}ne(!0);try{const s=await(await fetch("/api/vouchers/validate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:I.trim()}),credentials:"include"})).json();s.valid&&s.voucher?(C(s.voucher),m({title:"Voucher applied successfully!"})):(C(null),m({title:"Invalid voucher",description:s.message||"Voucher code is invalid",variant:"destructive"}))}catch{C(null),m({title:"Error validating voucher",variant:"destructive"})}finally{ne(!1)}},pe=L({mutationFn:async t=>{await M("POST","/api/vouchers/redeem",{voucherId:t})}}),N=se.filter(t=>{var s;return t.tableId!==j||t.status==="cancelled"||t.status==="served"?!1:(s=t.items)==null?void 0:s.some(a=>a.status==="approved"||a.status==="ready")}),d=(()=>{let t=0;N.forEach(i=>{var x;(x=i.items)==null||x.forEach(p=>{if(p.status==="approved"||p.status==="ready"){const f=F.find(b=>b.id===p.menuItemId);if(f){const b=K[p.id]??p.qty;t+=f.price*b}}})});const s=ie.filter(i=>i.isActive),a=["vat","service_tax","luxury_tax"],h=s.sort((i,x)=>{const p=a.indexOf(i.taxType),f=a.indexOf(x.taxType);return(p===-1?999:p)-(f===-1?999:f)});let l=t;const o={};h.forEach(i=>{const x=parseFloat(i.percent)/100,p=Math.round(l*x*100)/100,f=i.taxType==="vat"?"VAT":i.taxType==="service_tax"?"Service Tax":i.taxType==="luxury_tax"?"Luxury Tax":i.taxType;o[f]={rate:parseFloat(i.percent),amount:p},l=Math.round((l+p)*100)/100});const T=Object.values(o).reduce((i,x)=>i+x.amount,0);let y=Math.round((t+T)*100)/100,v=0;return c&&(c.discountType==="percentage"?v=Math.round(y*(parseFloat(c.discountAmount)/100)*100)/100:c.discountType==="fixed"&&(v=Math.min(parseFloat(c.discountAmount),y)),y=Math.round((y-v)*100)/100),{subtotal:t,taxBreakdown:o,totalTax:T,discountAmount:v,grandTotal:y}})(),w=parseFloat(D)||0,O=parseFloat(ee)||0,u=w+O,P=Math.max(0,u-d.grandTotal),ue=async()=>{var t;if(!r){m({title:"Error",description:"Please select a payment method",variant:"destructive"});return}if(N.length===0){m({title:"Error",description:"No orders to process",variant:"destructive"});return}if(r==="cash"&&w<d.grandTotal){m({title:"Error",description:"Cash received must be at least the bill amount",variant:"destructive"});return}if(r==="cash_fonepay"){if(Math.abs(u-d.grandTotal)>.01){u<d.grandTotal?m({title:"Error",description:`Total payment is ${n(d.grandTotal-u)} short. Cash + Fonepay must equal the bill amount.`,variant:"destructive"}):m({title:"Error",description:`Total payment is ${n(u-d.grandTotal)} over. Cash + Fonepay must equal the bill amount.`,variant:"destructive"});return}if(w<=0||O<=0){m({title:"Error",description:"Both cash and fonepay amounts must be greater than zero",variant:"destructive"});return}}try{c&&await pe.mutateAsync(c.id);const s=`Table: ${((t=U.find(a=>a.id===j))==null?void 0:t.name)||j}${c?` | Voucher: ${c.code}`:""}`;if(r==="cash_fonepay")await q.mutateAsync({txnType:"cash_in",amount:w.toFixed(2),paymentMethod:"cash",purpose:"restaurant_sale",reference:s}),await q.mutateAsync({txnType:"fonepay_in",amount:O.toFixed(2),paymentMethod:"fonepay",purpose:"restaurant_sale",reference:s});else{const a=r==="cash"?"cash_in":r==="pos"?"pos_in":r==="fonepay"?"fonepay_in":"cash_in";await q.mutateAsync({txnType:a,amount:d.grandTotal.toFixed(2),paymentMethod:r,purpose:"restaurant_sale",reference:s})}for(const a of N)await le.mutateAsync({orderId:a.id,status:"served"});await M("PUT",`/api/hotels/current/restaurant-tables/${j}`,{status:"available"}),await S.invalidateQueries({queryKey:["/api/hotels/current/kot-orders"]}),await S.invalidateQueries({queryKey:["/api/hotels/current/restaurant-tables"]}),re(),m({title:"Payment processed successfully"}),X(""),Z(""),z(""),C(null),Q(""),te(""),ae({})}catch{m({title:"Error",description:"Failed to process payment",variant:"destructive"})}},me=()=>{C(null),z(""),m({title:"Voucher removed"})},re=()=>{var v;const t=(g==null?void 0:g.name)||"HOTEL",s=(g==null?void 0:g.address)||"",a=(g==null?void 0:g.phone)||"",h=((v=U.find(i=>i.id===j))==null?void 0:v.name)||"Unknown",l=new Date;let o=`
<div style="font-family: 'Courier New', monospace; width: 300px; padding: 10px;">
  <div style="text-align: center; font-weight: bold; font-size: 16px; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
    ${t}
  </div>
  
  <div style="text-align: center; font-size: 11px; margin-bottom: 10px;">
    ${s?`${s}<br/>`:""}
    ${a?`Tel: ${a}<br/>`:""}
  </div>
  
  <div style="text-align: center; font-size: 12px; margin-bottom: 15px;">
    Restaurant Bill<br/>
    ${h}
  </div>
  
  <div style="font-size: 11px; margin-bottom: 10px;">
    <div>Date: ${l.toLocaleDateString("en-US",{year:"numeric",month:"short",day:"2-digit"})}</div>
    <div>Time: ${l.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</div>
    <div>Bill No: ${l.getTime().toString().slice(-8)}</div>
    <div>Cashier: ${B==null?void 0:B.username}</div>
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
`;N.forEach(i=>{var x;(x=i.items)==null||x.forEach(p=>{if(p.status==="approved"||p.status==="ready"){const f=F.find(b=>b.id===p.menuItemId);if(f){const b=K[p.id]??p.qty;b>0&&(o+=`
        <tr>
          <td style="padding: 3px 0;">${f.name}</td>
          <td style="text-align: center;">${b}</td>
          <td style="text-align: right;">${n(f.price*b)}</td>
        </tr>`)}}})}),o+=`
      </tbody>
    </table>
  </div>
  
  <div style="font-size: 11px; margin-top: 10px;">
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>Subtotal:</span>
      <span>${n(d.subtotal)}</span>
    </div>
`,Object.entries(d.taxBreakdown).forEach(([i,x])=>{o+=`
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>${i} (${x.rate}%):</span>
      <span>${n(x.amount)}</span>
    </div>`}),d.discountAmount>0&&c&&(o+=`
    <div style="display: flex; justify-content: space-between; padding: 3px 0; color: #16a34a;">
      <span>Discount (${c.code}):</span>
      <span>-${n(d.discountAmount)}</span>
    </div>`);const T=r==="cash"?"CASH":r==="pos"?"CARD/POS":r==="fonepay"?"FONEPAY":r==="cash_fonepay"?"CASH + FONEPAY":r.toUpperCase();o+=`
    <div style="display: flex; justify-content: space-between; padding: 10px 0 5px 0; margin-top: 5px; border-top: 2px dashed #000; font-weight: bold; font-size: 14px;">
      <span>GRAND TOTAL:</span>
      <span>${n(d.grandTotal)}</span>
    </div>
    
    <div style="display: flex; justify-content: space-between; padding: 5px 0; font-weight: bold;">
      <span>Payment Method:</span>
      <span>${T}</span>
    </div>`,r==="cash"&&w>0&&(o+=`
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>Cash Received:</span>
      <span>${n(w)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 3px 0; font-weight: bold;">
      <span>Change:</span>
      <span>${n(P)}</span>
    </div>`),r==="cash_fonepay"&&(o+=`
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>Cash:</span>
      <span>${n(w)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>Fonepay:</span>
      <span>${n(O)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 3px 0; font-weight: bold;">
      <span>Total Received:</span>
      <span>${n(u)}</span>
    </div>`,P>0&&(o+=`
    <div style="display: flex; justify-content: space-between; padding: 3px 0; font-weight: bold;">
      <span>Change:</span>
      <span>${n(P)}</span>
    </div>`)),o+=`
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 2px dashed #000; font-size: 12px;">
    Thank You! Visit Again<br/>
    <div style="margin-top: 5px; font-size: 10px;">
      This is a computer generated bill
    </div>
  </div>
</div>
    `;const y=window.open("","_blank","width=400,height=600");y&&(y.document.write(`
        <html>
          <head>
            <title>Bill - ${t}</title>
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
      `),y.document.close())};return e.jsx(fe,{title:"Cashier Billing",children:e.jsxs("div",{className:"p-6 space-y-6",children:[e.jsx("div",{className:"flex items-center justify-between",children:e.jsx("h1",{className:"text-3xl font-bold",children:"Table Billing"})}),e.jsx("div",{className:"space-y-6",children:e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"space-y-6",children:[e.jsxs(H,{children:[e.jsx(Y,{children:e.jsxs(G,{className:"flex items-center",children:[e.jsx(ge,{className:"h-5 w-5 mr-2"}),"Select Table"]})}),e.jsx(J,{children:e.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 gap-3",children:U.map(t=>{const s=se.some(a=>{var h;return a.tableId===t.id&&a.status!=="cancelled"&&a.status!=="served"&&((h=a.items)==null?void 0:h.some(l=>l.status==="approved"||l.status==="ready"))});return e.jsx("button",{onClick:()=>s&&X(t.id),disabled:!s,className:`p-4 rounded-lg border-2 transition-all ${j===t.id?"border-blue-500 bg-blue-50 dark:bg-blue-950/30":s?"border-gray-300 hover:border-blue-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800":"border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed dark:border-gray-800 dark:bg-gray-900"}`,"data-testid":`table-visual-${t.id}`,children:e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"font-bold text-lg",children:t.name}),e.jsxs("div",{className:"text-sm text-muted-foreground",children:["Capacity: ",t.capacity]}),s&&e.jsx("div",{className:"text-xs text-green-600 dark:text-green-400 font-medium mt-1",children:"Active Orders"})]})},t.id)})})})]}),j&&e.jsxs(H,{children:[e.jsx(Y,{children:e.jsx(G,{children:"Order Items (Approved/Ready)"})}),e.jsx(J,{children:N.length===0?e.jsx("p",{className:"text-muted-foreground text-sm",children:"No approved orders for this table"}):e.jsx("div",{className:"space-y-2",children:N.map(t=>{var s;return e.jsx("div",{className:"text-sm",children:(s=t.items)==null?void 0:s.map((a,h)=>{if(a.status==="approved"||a.status==="ready"){const l=F.find(o=>o.id===a.menuItemId);return l?e.jsxs("div",{className:"flex justify-between py-1","data-testid":`order-item-${h}`,children:[e.jsxs("span",{children:[l.name," x ",a.qty]}),e.jsx("span",{children:n(l.price*a.qty)})]},h):null}return null})},t.id)})})})]})]}),e.jsx("div",{className:"space-y-6",children:j&&N.length>0&&e.jsx(e.Fragment,{children:e.jsxs(H,{children:[e.jsx(Y,{children:e.jsx(G,{children:"Bill Summary"})}),e.jsxs(J,{className:"space-y-4",children:[e.jsxs("div",{className:"border rounded-lg p-4 space-y-3",children:[e.jsx("div",{className:"font-medium text-sm mb-2",children:"Order Items"}),N.map(t=>{var s;return e.jsx("div",{className:"space-y-2",children:(s=t.items)==null?void 0:s.map((a,h)=>{if(a.status==="approved"||a.status==="ready"){const l=F.find(T=>T.id===a.menuItemId);if(!l)return null;const o=K[a.id]??a.qty;return e.jsxs("div",{className:"flex items-center justify-between gap-2 py-1 border-b last:border-b-0","data-testid":`bill-item-${h}`,children:[e.jsxs("div",{className:"flex-1",children:[e.jsx("div",{className:"text-sm font-medium",children:l.name}),e.jsxs("div",{className:"text-xs text-muted-foreground",children:[n(l.price)," each"]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(A,{type:"number",min:"0",max:a.qty,value:o,onChange:T=>{const y=parseInt(T.target.value)||0;y>=0&&y<=a.qty&&ae(v=>({...v,[a.id]:y}))},className:"w-16 h-8 text-center","data-testid":`input-item-quantity-${h}`}),e.jsxs("span",{className:"text-sm text-muted-foreground",children:["/ ",a.qty]}),e.jsx("span",{className:"text-sm font-medium min-w-[80px] text-right",children:n(l.price*o)})]})]},h)}return null})},t.id)})]}),e.jsxs("div",{className:"border rounded-lg p-4 space-y-2",children:[e.jsxs("div",{className:"flex justify-between text-sm",children:[e.jsx("span",{children:"Subtotal:"}),e.jsx("span",{"data-testid":"text-subtotal",children:n(d.subtotal)})]}),Object.entries(d.taxBreakdown).map(([t,s])=>e.jsxs("div",{className:"flex justify-between text-sm",children:[e.jsxs("span",{children:[t," (",s.rate,"%):"]}),e.jsx("span",{children:n(s.amount)})]},t)),d.discountAmount>0&&c&&e.jsxs("div",{className:"flex justify-between text-sm text-green-600 dark:text-green-400",children:[e.jsxs("span",{children:["Discount (",c.code,"):"]}),e.jsxs("span",{children:["-",n(d.discountAmount)]})]}),e.jsxs("div",{className:"flex justify-between text-lg font-bold pt-2 border-t",children:[e.jsx("span",{children:"Total:"}),e.jsx("span",{"data-testid":"text-grand-total",children:n(d.grandTotal)})]})]}),e.jsxs("div",{className:"border rounded-lg p-4 space-y-3",children:[e.jsx("label",{className:"text-sm font-medium text-foreground",children:"Discount Voucher (Optional)"}),c?e.jsxs("div",{className:"flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(Te,{className:"h-5 w-5 text-green-600"}),e.jsxs("div",{children:[e.jsxs("p",{className:"text-sm font-medium text-green-900 dark:text-green-100",children:["Voucher Applied: ",c.code]}),e.jsx("p",{className:"text-xs text-green-700 dark:text-green-300",children:c.discountType==="percentage"?`${c.discountAmount}% discount`:`${n(parseFloat(c.discountAmount))} off`})]})]}),e.jsx(E,{variant:"outline",size:"sm",onClick:me,"data-testid":"button-remove-voucher",children:"Remove"})]}):e.jsxs("div",{className:"flex gap-2",children:[e.jsx(A,{type:"text",placeholder:"Enter voucher code",value:I,onChange:t=>z(t.target.value.toUpperCase()),"data-testid":"input-voucher-code"}),e.jsx(E,{onClick:ce,disabled:!I.trim()||oe,"data-testid":"button-apply-voucher",children:"Apply"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-sm font-medium text-foreground mb-2 block",children:"Payment Method"}),e.jsxs(be,{value:r,onValueChange:Z,children:[e.jsx(je,{className:"w-full","data-testid":"select-payment-method",children:e.jsx(Ne,{placeholder:"Choose payment method"})}),e.jsxs(we,{children:[e.jsx(_,{value:"cash","data-testid":"payment-option-cash",children:e.jsxs("div",{className:"flex items-center",children:[e.jsx(R,{className:"h-4 w-4 mr-2"}),"Cash"]})}),e.jsx(_,{value:"fonepay","data-testid":"payment-option-fonepay",children:e.jsxs("div",{className:"flex items-center",children:[e.jsx(V,{className:"h-4 w-4 mr-2"}),"Fonepay"]})}),e.jsx(_,{value:"pos","data-testid":"payment-option-pos",children:e.jsxs("div",{className:"flex items-center",children:[e.jsx(de,{className:"h-4 w-4 mr-2"}),"POS"]})}),e.jsx(_,{value:"cash_fonepay","data-testid":"payment-option-cash-fonepay",children:e.jsxs("div",{className:"flex items-center",children:[e.jsx(R,{className:"h-4 w-4 mr-1"}),e.jsx(V,{className:"h-4 w-4 mr-2"}),"Cash + Fonepay"]})})]})]})]}),r==="cash"&&e.jsxs("div",{className:"border rounded-lg p-4 space-y-3 bg-blue-50 dark:bg-blue-950/20",children:[e.jsx(W,{className:"text-sm font-medium",children:"Cash Received"}),e.jsx(A,{type:"number",placeholder:"Enter cash amount",value:D,onChange:t=>Q(t.target.value),step:"0.01",min:d.grandTotal,"data-testid":"input-cash-received"}),w>=d.grandTotal&&e.jsxs("div",{className:"flex justify-between items-center p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-lg",children:[e.jsx("span",{className:"font-medium text-green-900 dark:text-green-100",children:"Change:"}),e.jsx("span",{className:"text-xl font-bold text-green-700 dark:text-green-300","data-testid":"text-change-amount",children:n(P)})]})]}),r==="cash_fonepay"&&e.jsx("div",{className:"border rounded-lg p-4 space-y-3 bg-blue-50 dark:bg-blue-950/20",children:e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{children:[e.jsx(W,{className:"text-sm font-medium",children:"Cash Amount"}),e.jsx(A,{type:"number",placeholder:"Enter cash amount",value:D,onChange:t=>Q(t.target.value),step:"0.01",min:"0","data-testid":"input-cash-amount-split"})]}),e.jsxs("div",{children:[e.jsx(W,{className:"text-sm font-medium",children:"Fonepay Amount"}),e.jsx(A,{type:"number",placeholder:"Enter fonepay amount",value:ee,onChange:t=>te(t.target.value),step:"0.01",min:"0","data-testid":"input-fonepay-amount"})]}),(()=>{const a=Math.abs(u-d.grandTotal)<=.01;return u===0?e.jsxs("div",{className:"flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg",children:[e.jsx("span",{className:"font-medium",children:"Total Received:"}),e.jsx("span",{className:"text-lg font-bold","data-testid":"text-total-received",children:n(u)})]}):a?e.jsxs("div",{className:"flex justify-between items-center p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-lg",children:[e.jsx("span",{className:"font-medium text-green-900 dark:text-green-100",children:"✓ Total Received (Exact Match):"}),e.jsx("span",{className:"text-lg font-bold text-green-700 dark:text-green-300","data-testid":"text-total-received",children:n(u)})]}):u<d.grandTotal?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg",children:[e.jsx("span",{className:"font-medium",children:"Total Received:"}),e.jsx("span",{className:"text-lg font-bold","data-testid":"text-total-received",children:n(u)})]}),e.jsxs("div",{className:"flex justify-between items-center p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800 rounded-lg",children:[e.jsx("span",{className:"font-medium text-yellow-900 dark:text-yellow-100",children:"Remaining:"}),e.jsx("span",{className:"text-lg font-bold text-yellow-700 dark:text-yellow-300","data-testid":"text-remaining-amount",children:n(d.grandTotal-u)})]})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg",children:[e.jsx("span",{className:"font-medium",children:"Total Received:"}),e.jsx("span",{className:"text-lg font-bold","data-testid":"text-total-received",children:n(u)})]}),e.jsxs("div",{className:"flex justify-between items-center p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg",children:[e.jsx("span",{className:"font-medium text-red-900 dark:text-red-100",children:"Over by:"}),e.jsx("span",{className:"text-lg font-bold text-red-700 dark:text-red-300","data-testid":"text-over-amount",children:n(u-d.grandTotal)})]})]})})()]})}),e.jsxs("div",{className:"flex gap-3",children:[e.jsxs(E,{className:"flex-1",onClick:re,variant:"outline","data-testid":"button-print-bill",children:[e.jsx(ve,{className:"h-4 w-4 mr-2"}),"Print Bill"]}),e.jsxs(E,{className:"flex-1",onClick:ue,disabled:!r||q.isPending,"data-testid":"button-process-payment",children:[r==="cash"&&e.jsx(R,{className:"h-4 w-4 mr-2"}),r==="pos"&&e.jsx(de,{className:"h-4 w-4 mr-2"}),r==="fonepay"&&e.jsx(V,{className:"h-4 w-4 mr-2"}),r==="cash_fonepay"&&e.jsxs(e.Fragment,{children:[e.jsx(R,{className:"h-4 w-4 mr-1"}),e.jsx(V,{className:"h-4 w-4 mr-2"})]}),"Process Payment"]})]})]})]})})})]})})]})})}export{Oe as default};
