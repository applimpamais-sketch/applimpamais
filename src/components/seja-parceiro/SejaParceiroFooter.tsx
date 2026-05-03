 const SejaParceiroFooter = () => {
   return (
     <footer className="py-8 px-4 border-t border-slate-800">
       <div className="max-w-6xl mx-auto text-center">
         <p className="text-slate-500 text-sm">
           © {new Date().getFullYear()} RC Limpa Mais. Todos os direitos reservados.
         </p>
         <p className="text-slate-600 text-xs mt-2">
           Programa de Parceiros - Limpeza de Estofados em BH
         </p>
       </div>
     </footer>
   );
 };
 
 export default SejaParceiroFooter;