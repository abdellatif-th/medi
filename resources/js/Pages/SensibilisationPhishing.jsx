import { useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Head } from "@inertiajs/react";

export default function SensibilisationPhishing() {
  const [showTips, setShowTips] = useState(false);
  
  return (
    <>
        <Head title="Phishing Email Generator" />

      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-200 to-red-600 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-10 max-w-lg text-center border-4 border-red-600 transition-all duration-500 hover:scale-[1.02]">
          
          {/* Icône d’avertissement */}
          <div className="flex justify-center mb-4">
            <AlertTriangle className="text-red-600 w-16 h-16 animate-bounce" />
          </div>

          {/* Titre principal */}
          <h1 className="text-3xl font-extrabold text-red-700 mb-4">
            ⚠️ Attention : Simulation de Phishing
          </h1>

          {/* Message principal */}
          <p className="text-gray-800 dark:text-gray-200 mb-4 text-lg leading-relaxed">
            Vous avez cliqué sur un lien dangereux <strong>(simulation)</strong>.  
            Aucune donnée n’a été volée, mais dans un vrai cas, vos informations personnelles auraient pu être compromises.
          </p>

          {/* Encadré d’avertissement */}
          <div className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 p-4 rounded-lg mb-6 shadow-inner">
            ⚠️ Cet exercice vise à vous sensibiliser aux risques liés aux emails frauduleux.
          </div>

          {/* Bouton afficher/masquer conseils */}
          <button
            onClick={() => setShowTips(!showTips)}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 active:scale-95 mb-6 transition shadow-lg font-medium"
          >
            {showTips ? "❌ Masquer les conseils" : "🛡️ Comment se protéger ?"}
          </button>

          {/* Conseils affichés */}
          {showTips && (
            <div className="bg-gray-100 dark:bg-green-700 rounded-lg p-4 text-left mb-6 animate-fadeIn">
              <h2 className="font-semibold text-green-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-300" />
                Bonnes pratiques :
              </h2>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-2">
                <li>Vérifiez attentivement l’adresse email de l’expéditeur.</li>
                <li>Ne cliquez jamais sur un lien suspect sans vérifier l’URL.</li>
                <li>Faites attention aux fautes d’orthographe et de grammaire.</li>
                <li>Méfiez-vous des demandes urgentes d’informations personnelles.</li>
                <li>Activez la double authentification sur vos comptes sensibles.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
