import { Resend } from "resend";
import type { FlightOffer } from "@shared/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendFlightAlert(
  email: string,
  searchName: string,
  flight: FlightOffer,
  priceChange?: number
) {
  try {
    const subject = priceChange
      ? `🎯 Baisse de prix : ${flight.origin} → ${flight.destination} à ${flight.price}€`
      : `✈️ Nouveau vol : ${flight.origin} → ${flight.destination} à ${flight.price}€`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .flight-card { background: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .price { font-size: 36px; font-weight: bold; color: #3b82f6; margin: 10px 0; }
            .detail { margin: 10px 0; }
            .detail-label { color: #6b7280; font-size: 14px; }
            .detail-value { font-weight: 600; color: #111827; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Discovery Flights Flex</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">${searchName}</p>
            </div>
            <div class="content">
              ${
                priceChange
                  ? `<div style="text-align: center; margin-bottom: 20px;">
                      <span class="badge">Prix baissé de ${Math.abs(priceChange)}%</span>
                     </div>`
                  : ""
              }
              
              <div class="flight-card">
                <h2 style="margin-top: 0; color: #111827;">${flight.origin} → ${
      flight.destination
    }</h2>
                
                <div class="price">${flight.price} ${flight.currency}</div>
                
                <div class="detail">
                  <div class="detail-label">📅 Dates</div>
                  <div class="detail-value">
                    Départ : ${flight.outboundDate}<br>
                    ${flight.returnDate ? `Retour : ${flight.returnDate}` : "Aller simple"}
                  </div>
                </div>
                
                <div class="detail">
                  <div class="detail-label">⏱️ Durée</div>
                  <div class="detail-value">${flight.duration}</div>
                </div>
                
                <div class="detail">
                  <div class="detail-label">✈️ Compagnies</div>
                  <div class="detail-value">${flight.airlines.join(", ")}</div>
                </div>
                
                <div class="detail">
                  <div class="detail-label">🔄 Escales</div>
                  <div class="detail-value">${
                    flight.stops === 0
                      ? "Vol direct"
                      : `${flight.stops} escale${flight.stops > 1 ? "s" : ""}`
                  }</div>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${
                  flight.bookingLink || "https://www.google.com/flights"
                }" class="button">
                  Voir les détails et réserver
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                💡 <strong>Astuce :</strong> Les prix peuvent varier rapidement. Nous vous recommandons de réserver dès que possible si cette offre vous intéresse.
              </p>
            </div>
            
            <div class="footer">
              <p>Vous recevez cet email car vous avez activé des alertes pour "${searchName}".</p>
              <p style="margin-top: 10px;">Discovery Flights Flex - Trouvez des vols inspirants</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: "Discovery Flights <onboarding@resend.dev>",
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to send flight alert:", error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, searchName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Discovery Flights <onboarding@resend.dev>",
      to: email,
      subject: "🎉 Votre recherche est activée !",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: 'Inter', sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px; text-align: center;">
                <h1>Bienvenue sur Discovery Flights Flex !</h1>
              </div>
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb;">
                <p>Bonjour,</p>
                <p>Votre recherche "<strong>${searchName}</strong>" est maintenant active !</p>
                <p>Nous surveillerons les vols correspondant à vos critères et vous alerterons dès qu'une opportunité intéressante apparaît.</p>
                <p style="background: #f9fafb; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                  💡 <strong>Astuce :</strong> Plus vos critères sont flexibles, plus vous découvrirez de destinations inattendues à des prix avantageux.
                </p>
                <p>À très bientôt,<br>L'équipe Discovery Flights Flex</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
    }

    return data;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}
