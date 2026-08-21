import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import Groq from 'groq-sdk';
import { SaveTowerDto } from './dto/tower.dto.js';

@Injectable()
export class InventoryTowerGenService {
  private groq: Groq | null = null;

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.groq = new Groq({ apiKey });
    }
  }

  async generateTowerPrompt(projectId: string, prompt: string) {
    if (!this.groq) {
      throw new BadRequestException('AI is not configured. Please set GROQ_API_KEY.');
    }

    const systemPrompt = `
You are an expert real estate CRM assistant. 
The user will provide a prompt to generate a residential or commercial tower structure.
Output ONLY valid JSON representing the tower structure.
Schema:
{
  "name": "Tower Name",
  "floors": [
    {
      "floorNumber": 1,
      "name": "Ground Floor",
      "units": [
        { "unitNumber": "101", "type": "SHOP", "basePrice": 200000, "commissionPercentage": 2.0, "carpetArea": 500, "facing": "East" }
      ]
    }
  ]
}
Valid unit types: STUDIO, ONE_BHK, TWO_BHK, THREE_BHK, FOUR_BHK, PENTHOUSE, VILLA, SHOP, OFFICE.
Ensure you set the "commissionPercentage" accurately if the user instructs you to apply a specific commission or brokerage percentage to units.
Respond ONLY with JSON, no other text.`;

    const chatCompletion = await this.groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'openai/gpt-oss-120b',
      response_format: { type: 'json_object' }
    });

    const result = chatCompletion.choices[0]?.message?.content;
    if (!result) throw new Error('AI failed to generate response');

    return JSON.parse(result);
  }

  async saveGeneratedTower(projectId: string, towerData: SaveTowerDto) {
    return this.prisma.$transaction(async (tx) => {
      let totalUnits = 0;
      for (const floor of towerData.floors || []) {
        totalUnits += (floor.units || []).length;
      }

      const tower = await tx.tower.create({
        data: {
          projectId,
          name: towerData.name,
          totalFloors: (towerData.floors || []).length,
          totalUnits
        }
      });

      for (const f of towerData.floors || []) {
        const floorNumber = typeof f.floorNumber === 'number' ? f.floorNumber : parseInt(String(f.floorNumber).replace(/[^\d.-]/g, '')) || 0;
        const floor = await tx.floor.create({
          data: {
            towerId: tower.id,
            floorNumber,
            name: f.name || `Floor ${floorNumber}`,
            totalUnits: (f.units || []).length
          }
        });

        const unitsToCreate: any[] = [];
        for (const u of f.units || []) {
          // Enforce valid enum
          let type = String(u.type).toUpperCase().trim();
          const validTypes = ['STUDIO', 'ONE_BHK', 'TWO_BHK', 'THREE_BHK', 'FOUR_BHK', 'PENTHOUSE', 'VILLA', 'SHOP', 'OFFICE'];
          if (!validTypes.includes(type)) {
            type = 'STUDIO'; // safe fallback
          }

          // Parse numerics safely in case AI returns strings like "1,500,000"
          const basePrice = parseFloat(String(u.basePrice || 0).replace(/[^\d.-]/g, '')) || 0;
          const carpetArea = parseFloat(String(u.carpetArea || 0).replace(/[^\d.-]/g, '')) || 0;
          let commissionPercentage: number | null = null;
          if (u.commissionPercentage !== undefined && u.commissionPercentage !== null) {
            commissionPercentage = parseFloat(String(u.commissionPercentage).replace(/[^\d.-]/g, '')) || 0;
          }

          unitsToCreate.push({
            floorId: floor.id,
            unitNumber: String(u.unitNumber),
            type: type as any,
            status: 'AVAILABLE',
            basePrice,
            carpetArea,
            commissionPercentage,
            facing: u.facing ? String(u.facing) : null
          });
        }

        if (unitsToCreate.length > 0) {
          await tx.unit.createMany({ data: unitsToCreate });
        }
      }
      return tower;
    }, {
      maxWait: 10000,
      timeout: 30000 // 30 seconds
    });
  }
}
